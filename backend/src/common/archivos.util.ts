import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, join } from 'path';

export const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');

/** Archivo en memoria tal como lo entrega multer. */
export type ArchivoSubido = Express.Multer.File;

/** multer decodifica el nombre como latin1: lo regresamos a UTF-8 para conservar acentos y ñ. */
export function nombreOriginal(archivo: ArchivoSubido): string {
  const nombre = Buffer.from(archivo.originalname, 'latin1').toString('utf8');
  return basename(nombre).replace(/[\\/\0]/g, '_') || 'archivo';
}

/**
 * Guarda los archivos de una captura en `uploads/<carpeta>/<uuid>/<nombre>` (misma estructura que
 * `storage/app/public` en Laravel) y regresa las rutas relativas que se guardan en la base.
 */
export class CarpetaDeCaptura {
  readonly uuid = randomUUID();
  private creada = false;

  constructor(private readonly carpeta: 'Documentos' | 'Convocatorias') {}

  get rutaRelativa(): string {
    return `${this.carpeta}/${this.uuid}`;
  }

  async guardar(archivo: ArchivoSubido, nombre = nombreOriginal(archivo)): Promise<string> {
    const dir = join(UPLOADS_DIR, this.carpeta, this.uuid);
    if (!this.creada) {
      await mkdir(dir, { recursive: true });
      this.creada = true;
    }
    await writeFile(join(dir, nombre), archivo.buffer);
    return `${this.rutaRelativa}/${nombre}`;
  }

  /** Guarda un archivo ya armado (p. ej. el .zip de contratos) junto a la carpeta de la captura. */
  async guardarBuffer(buffer: Buffer, nombre: string): Promise<string> {
    const dir = join(UPLOADS_DIR, this.carpeta);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, nombre), buffer);
    return `${this.carpeta}/${nombre}`;
  }
}
