import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentoInformativo } from '../database/models/documento-informativo.model';
import { ArchivoSubido, CarpetaDeCaptura } from '../common/archivos.util';

export const TIPOS_DOCUMENTO: Record<number, string> = {
  1: 'PROGRAMA ANUAL DE ADQUISICIONES',
  2: 'PROGRAMA ANUAL DE ARRENDAMIENTOS',
  3: 'CATALOGO DE BIENES Y SERVICIOS',
};

@Injectable()
export class DocumentosService {
  constructor(
    @InjectModel(DocumentoInformativo)
    private readonly documentoModel: typeof DocumentoInformativo,
  ) {}

  tipos() {
    return Object.entries(TIPOS_DOCUMENTO).map(([id, nombre]) => ({ id: Number(id), nombre }));
  }

  async listar() {
    const filas = await this.documentoModel.findAll({ order: [['tipo', 'ASC'], ['id', 'ASC']] });
    return filas.map((f) => ({
      id: f.id,
      tipo: f.tipo,
      tipoNombre: TIPOS_DOCUMENTO[f.tipo] ?? TIPOS_DOCUMENTO[3],
      activo: !!f.activo,
      path: f.path,
    }));
  }

  /** Al subir un documento nuevo del mismo tipo, el anterior deja de ser el activo. */
  async crear(tipoValor: string | undefined, archivo: ArchivoSubido | undefined) {
    const tipo = Number(tipoValor);
    if (!TIPOS_DOCUMENTO[tipo]) throw new BadRequestException('El tipo de documento no es válido');
    if (!archivo) throw new BadRequestException('Falta el documento');

    await this.documentoModel.update({ activo: false }, { where: { tipo, activo: true } });

    const carpeta = new CarpetaDeCaptura('Convocatorias');
    const path = await carpeta.guardar(archivo);
    const documento = await this.documentoModel.create({ tipo, path, activo: true });
    return { id: documento.id };
  }

  async eliminar(id: number) {
    const documento = await this.documentoModel.findByPk(id);
    if (!documento) throw new NotFoundException('Documento no encontrado');
    await documento.destroy();
    return { ok: true };
  }
}
