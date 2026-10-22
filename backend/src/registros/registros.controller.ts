import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrosService } from './registros.service';
import type { ArchivosRegistro } from './registros.service';

const MAX_ARCHIVO_BYTES = 100 * 1024 * 1024;

const CAMPOS_ARCHIVO = FileFieldsInterceptor(
  [
    { name: 'documento', maxCount: 1 },
    { name: 'documento_base', maxCount: 1 },
    { name: 'documento_ja', maxCount: 1 },
    { name: 'documento_pap', maxCount: 1 },
    { name: 'documento_ef', maxCount: 1 },
    { name: 'contrato', maxCount: 30 },
  ],
  { limits: { fileSize: MAX_ARCHIVO_BYTES } },
);

@Controller('registros')
@UseGuards(JwtAuthGuard)
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  listar(@Query('anio') anio?: string) {
    return this.registrosService.listar(anio ? Number(anio) : undefined);
  }

  @Get('anios')
  anios() {
    return this.registrosService.anios();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.registrosService.obtener(id);
  }

  @Post()
  @UseInterceptors(CAMPOS_ARCHIVO)
  crear(@Body() body: Record<string, string>, @UploadedFiles() archivos: ArchivosRegistro) {
    return this.registrosService.crear(body, archivos ?? {});
  }

  @Put(':id')
  @UseInterceptors(CAMPOS_ARCHIVO)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFiles() archivos: ArchivosRegistro,
  ) {
    return this.registrosService.actualizar(id, body, archivos ?? {});
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.registrosService.eliminar(id);
  }
}
