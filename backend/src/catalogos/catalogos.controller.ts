import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Licitacion } from '../database/models/licitacion.model';

@Controller('catalogos')
@UseGuards(JwtAuthGuard)
export class CatalogosController {
  constructor(@InjectModel(Licitacion) private readonly licitacionModel: typeof Licitacion) {}

  /** Tipos de procedimiento para el selector del formulario. */
  @Get('tipos-procedimiento')
  async tiposProcedimiento() {
    const filas = await this.licitacionModel.findAll({ attributes: ['id', 'nombre'], order: [['id', 'ASC']] });
    return filas.map((f) => ({ id: f.id, nombre: f.nombre }));
  }
}
