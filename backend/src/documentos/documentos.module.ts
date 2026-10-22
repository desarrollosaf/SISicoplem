import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentoInformativo } from '../database/models/documento-informativo.model';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

@Module({
  imports: [SequelizeModule.forFeature([DocumentoInformativo]), JwtAuthModule],
  controllers: [DocumentosController],
  providers: [DocumentosService],
})
export class DocumentosModule {}
