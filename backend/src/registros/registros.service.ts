import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import AdmZip from 'adm-zip';
import { Sicoplem } from '../database/models/sicoplem.model';
import { Licitacion } from '../database/models/licitacion.model';
import { ArchivoSubido, CarpetaDeCaptura, nombreOriginal } from '../common/archivos.util';

export type CampoArchivo =
  | 'documento'
  | 'documento_base'
  | 'documento_ja'
  | 'documento_pap'
  | 'documento_ef';

export interface ArchivosRegistro {
  documento?: ArchivoSubido[];
  documento_base?: ArchivoSubido[];
  documento_ja?: ArchivoSubido[];
  documento_pap?: ArchivoSubido[];
  documento_ef?: ArchivoSubido[];
  contrato?: ArchivoSubido[];
}

const ORDINALES = ['uno', 'dos', 'tres', 'cuatro'] as const;

const camposDeFases = (cuantas: number) =>
  ORDINALES.slice(0, cuantas).flatMap((o) => [`dia_${o}`, `hora_${o}`, `lugar_${o}`, `radio_${o}`]);

/**
 * Qué captura cada tipo de procedimiento (igual que lo que muestra el formulario original):
 *  1 Licitación Pública y 2 Invitación Restringida y 6 Enajenaciones: 4 fases (venta de bases,
 *    junta de aclaraciones, presentación y apertura de propuestas, fallo).
 *  4 Adjudicación directa LPNP/IRP: 2 fases (apertura de propuestas y fallo).
 *  3 Adjudicación directa, 5 Arrendamiento, 7 Donaciones, 8 Enajenación directa: solo documento.
 */
interface ReglaTipo {
  campos: string[];
  archivos: CampoArchivo[];
  contrato: boolean;
}

const CUATRO_FASES: ReglaTipo['campos'] = camposDeFases(4);

const REGLAS: Record<number, ReglaTipo> = {
  1: {
    campos: CUATRO_FASES,
    archivos: ['documento', 'documento_base', 'documento_ja', 'documento_pap', 'documento_ef'],
    contrato: true,
  },
  2: {
    campos: CUATRO_FASES,
    archivos: ['documento_base', 'documento_ja', 'documento_pap', 'documento_ef'],
    contrato: true,
  },
  3: { campos: [], archivos: ['documento'], contrato: true },
  4: { campos: camposDeFases(2), archivos: ['documento_pap', 'documento_ef'], contrato: true },
  5: { campos: [], archivos: ['documento'], contrato: false },
  6: {
    campos: CUATRO_FASES,
    archivos: ['documento', 'documento_base', 'documento_ja', 'documento_pap', 'documento_ef'],
    contrato: false,
  },
  7: { campos: [], archivos: ['documento'], contrato: false },
  8: { campos: [], archivos: ['documento'], contrato: false },
};

const SIN_REGLA: ReglaTipo = { campos: [], archivos: ['documento'], contrato: false };

function hoyYAhora(): { fecha: string; hora: string } {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return {
    fecha: `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`,
    hora: `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`,
  };
}

@Injectable()
export class RegistrosService {
  constructor(
    @InjectModel(Sicoplem) private readonly sicoplemModel: typeof Sicoplem,
    @InjectModel(Licitacion) private readonly licitacionModel: typeof Licitacion,
  ) {}

  async listar(anio?: number) {
    const where: WhereOptions = {};
    if (anio) {
      where['fecha'] = { [Op.between]: [`${anio}-01-01`, `${anio}-12-31`] };
    }
    const filas = await this.sicoplemModel.findAll({
      where,
      attributes: ['id', 'tipo', 'nombre', 'fecha'],
      include: [{ model: Licitacion, attributes: ['id', 'nombre'] }],
      order: [
        ['fecha', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return filas.map((f) => ({
      id: f.id,
      tipo: f.tipo,
      tipoNombre: f.tipos?.nombre ?? null,
      nombre: f.nombre,
      fecha: f.fecha,
    }));
  }

  /** Años con registros, para el filtro de la lista. */
  async anios(): Promise<number[]> {
    const filas = await this.sicoplemModel.findAll({ attributes: ['fecha'], raw: true });
    const set = new Set<number>();
    for (const f of filas as unknown as { fecha: string | null }[]) {
      if (f.fecha) set.add(Number(String(f.fecha).slice(0, 4)));
    }
    return [...set].sort((a, b) => b - a);
  }

  async obtener(id: number) {
    const registro = await this.sicoplemModel.findByPk(id);
    if (!registro) throw new NotFoundException('Registro no encontrado');
    return registro.get({ plain: true });
  }

  async crear(body: Record<string, string>, archivos: ArchivosRegistro) {
    const tipo = await this.validarTipo(body['tipo']);
    const regla = REGLAS[tipo] ?? SIN_REGLA;
    const carpeta = new CarpetaDeCaptura('Documentos');

    const datos: Record<string, unknown> = {
      tipo,
      nombre: this.texto(body['nombre']),
      ...hoyYAhora(),
      ...this.camposDeTexto(body, regla),
      ...(await this.rutasDeArchivos(archivos, regla, carpeta)),
      ...(await this.rutaDeContrato(archivos.contrato, regla, carpeta)),
    };

    const registro = await this.sicoplemModel.create(datos);
    return { id: registro.id };
  }

  async actualizar(id: number, body: Record<string, string>, archivos: ArchivosRegistro) {
    const registro = await this.sicoplemModel.findByPk(id);
    if (!registro) throw new NotFoundException('Registro no encontrado');

    const regla = REGLAS[registro.tipo] ?? SIN_REGLA;
    const carpeta = new CarpetaDeCaptura('Documentos');

    await registro.update({
      nombre: this.texto(body['nombre']),
      ...this.camposDeTexto(body, regla),
      ...(await this.rutasDeArchivos(archivos, regla, carpeta)),
      ...(await this.rutaDeContrato(archivos.contrato, regla, carpeta)),
    });
    return { id: registro.id };
  }

  async eliminar(id: number) {
    const registro = await this.sicoplemModel.findByPk(id);
    if (!registro) throw new NotFoundException('Registro no encontrado');
    await registro.destroy();
    return { ok: true };
  }

  private async validarTipo(valor: string | undefined): Promise<number> {
    const tipo = Number(valor);
    if (!Number.isInteger(tipo) || tipo <= 0 || !(await this.licitacionModel.findByPk(tipo))) {
      throw new BadRequestException('El tipo de procedimiento no es válido');
    }
    return tipo;
  }

  /** Cadena vacía = sin dato (Laravel convertía '' en NULL). */
  private texto(valor: string | undefined): string | null | undefined {
    if (valor === undefined) return undefined;
    const limpio = String(valor).trim();
    return limpio === '' ? null : limpio;
  }

  private camposDeTexto(body: Record<string, string>, regla: ReglaTipo) {
    const datos: Record<string, string | null> = {};
    for (const campo of regla.campos) {
      const valor = this.texto(body[campo]);
      if (valor !== undefined) datos[campo] = valor;
    }
    return datos;
  }

  private async rutasDeArchivos(
    archivos: ArchivosRegistro,
    regla: ReglaTipo,
    carpeta: CarpetaDeCaptura,
  ) {
    const rutas: Partial<Record<CampoArchivo, string>> = {};
    for (const campo of regla.archivos) {
      const archivo = archivos[campo]?.[0];
      if (archivo) rutas[campo] = await carpeta.guardar(archivo);
    }
    return rutas;
  }

  /** Un contrato se guarda tal cual; varios se comprimen en un .zip. */
  private async rutaDeContrato(
    contratos: ArchivoSubido[] | undefined,
    regla: ReglaTipo,
    carpeta: CarpetaDeCaptura,
  ): Promise<{ path_contrato?: string }> {
    if (!regla.contrato || !contratos?.length) return {};

    if (contratos.length === 1) {
      return { path_contrato: await carpeta.guardar(contratos[0]) };
    }

    const zip = new AdmZip();
    const usados = new Set<string>();
    for (const archivo of contratos) {
      zip.addFile(this.nombreUnico(nombreOriginal(archivo), usados), archivo.buffer);
    }
    return { path_contrato: await carpeta.guardarBuffer(zip.toBuffer(), `${carpeta.uuid}.zip`) };
  }

  private nombreUnico(nombre: string, usados: Set<string>): string {
    let candidato = nombre;
    const punto = nombre.lastIndexOf('.');
    const base = punto > 0 ? nombre.slice(0, punto) : nombre;
    const ext = punto > 0 ? nombre.slice(punto) : '';
    for (let n = 2; usados.has(candidato); n++) candidato = `${base} (${n})${ext}`;
    usados.add(candidato);
    return candidato;
  }
}
