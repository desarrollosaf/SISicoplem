import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sicoplem } from '../database/models/sicoplem.model';
import { Licitacion } from '../database/models/licitacion.model';
import { DocumentoInformativo } from '../database/models/documento-informativo.model';

const TIPOS_POR_GRUPO: Record<string, number[]> = {
  adquisiciones: [1, 2, 3, 4],
  arrendamiento: [5, 6, 7, 8],
};

/** Consulta pública (landing): sin autenticación, solo lectura. */
@Controller('publico')
export class PublicoController {
  constructor(
    @InjectModel(Sicoplem) private readonly sicoplemModel: typeof Sicoplem,
    @InjectModel(DocumentoInformativo)
    private readonly documentoModel: typeof DocumentoInformativo,
  ) {}

  @Get('procedimientos')
  async procedimientos(@Query('grupo') grupo = 'adquisiciones') {
    const tipos = TIPOS_POR_GRUPO[grupo] ?? TIPOS_POR_GRUPO['adquisiciones'];
    const filas = await this.sicoplemModel.findAll({
      where: { tipo: { [Op.in]: tipos } },
      attributes: ['id', 'tipo', 'nombre', 'fecha'],
      order: [['id', 'ASC']],
    });
    return filas.map((f) => f.get({ plain: true }));
  }

  @Get('procedimientos/:id')
  async procedimiento(@Param('id', ParseIntPipe) id: number) {
    const fila = await this.sicoplemModel.findByPk(id, {
      include: [{ model: Licitacion, attributes: ['id', 'nombre'] }],
    });
    if (!fila) throw new NotFoundException('Procedimiento no encontrado');
    const { tipos, ...datos } = fila.get({ plain: true }) as Sicoplem & { tipos?: Licitacion };
    return { ...datos, tipoNombre: tipos?.nombre ?? null };
  }

  /** Documento activo de cada tipo (programas anuales y catálogo). */
  @Get('documentos')
  async documentos() {
    const activos = await this.documentoModel.findAll({ where: { activo: true }, order: [['id', 'ASC']] });
    const porTipo = (tipo: number) => activos.find((d) => d.tipo === tipo)?.path ?? null;
    return {
      programaAdquisiciones: porTipo(1),
      programaArrendamientos: porTipo(2),
      catalogoBienes: porTipo(3),
    };
  }
}
