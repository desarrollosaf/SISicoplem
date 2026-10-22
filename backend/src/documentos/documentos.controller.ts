import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ArchivoSubido } from '../common/archivos.util';
import { DocumentosService } from './documentos.service';

@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  listar() {
    return this.documentosService.listar();
  }

  @Get('tipos')
  tipos() {
    return this.documentosService.tipos();
  }

  @Post()
  @UseInterceptors(FileInterceptor('documento', { limits: { fileSize: 100 * 1024 * 1024 } }))
  crear(@Body('tipo') tipo: string, @UploadedFile() archivo: ArchivoSubido) {
    return this.documentosService.crear(tipo, archivo);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.eliminar(id);
  }
}
