import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/models/user.model';
import { Role } from '../database/models/role.model';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';

const MAX_INTENTOS = 5;
const VENTANA_MS = 60 * 1000;

@Injectable()
export class AuthService {
  /** Intentos fallidos por correo+IP (igual que el límite de 5 intentos por minuto de Laravel). */
  private readonly intentos = new Map<string, { cuenta: number; desde: number }>();

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string, ip: string) {
    const llave = `${email.trim().toLowerCase()}|${ip}`;
    this.verificarLimite(llave);

    const user = await this.userModel.findOne({
      where: { email: email.trim() },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user || !(await this.coincide(password, user.password))) {
      this.registrarFallo(llave);
      throw new UnauthorizedException('Las credenciales no coinciden.');
    }

    this.intentos.delete(llave);

    const roles = (user.roles ?? []).map((r) => r.name);
    const rol = roles.includes('Administrador') ? 'administrador' : 'invitado';

    const payload = { sub: user.id, email: user.email, rol };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwtSecret'),
      expiresIn: this.configService.get<number>('auth.jwtExpiresInSeconds'),
    });

    return {
      access_token: accessToken,
      user: { id: user.id, nombre: user.name, email: user.email, rol },
    };
  }

  async cambiarPassword(userId: number, dto: CambiarPasswordDto) {
    if (dto.new_password !== dto.new_password_confirmation) {
      throw new BadRequestException('No coinciden las contraseñas');
    }
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new UnauthorizedException();

    user.password = await bcrypt.hash(dto.new_password, 10);
    await user.save();
    return { ok: true };
  }

  /** Laravel guarda bcrypt como `$2y$`; bcryptjs lo reconoce como `$2a$`/`$2b$`. */
  private coincide(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash.replace(/^\$2y\$/, '$2a$'));
  }

  private verificarLimite(llave: string): void {
    const registro = this.intentos.get(llave);
    if (!registro) return;
    if (Date.now() - registro.desde > VENTANA_MS) {
      this.intentos.delete(llave);
      return;
    }
    if (registro.cuenta >= MAX_INTENTOS) {
      const segundos = Math.ceil((VENTANA_MS - (Date.now() - registro.desde)) / 1000);
      throw new HttpException(
        `Demasiados intentos. Intenta de nuevo en ${segundos} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registrarFallo(llave: string): void {
    const registro = this.intentos.get(llave);
    if (!registro || Date.now() - registro.desde > VENTANA_MS) {
      this.intentos.set(llave, { cuenta: 1, desde: Date.now() });
    } else {
      registro.cuenta++;
    }
  }
}
