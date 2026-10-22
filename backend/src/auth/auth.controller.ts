import { Body, Controller, HttpCode, HttpStatus, Ip, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    return this.authService.login(loginDto.email, loginDto.password, ip);
  }

  @Post('cambiar-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  cambiarPassword(@Req() req: Request, @Body() dto: CambiarPasswordDto) {
    const { sub } = req['user'] as { sub: number };
    return this.authService.cambiarPassword(sub, dto);
  }
}
