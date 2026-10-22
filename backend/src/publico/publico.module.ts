import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sicoplem } from '../database/models/sicoplem.model';
import { Licitacion } from '../database/models/licitacion.model';
import { DocumentoInformativo } from '../database/models/documento-informativo.model';
import { PublicoController } from './publico.controller';

@Module({
  imports: [SequelizeModule.forFeature([Sicoplem, Licitacion, DocumentoInformativo])],
  controllers: [PublicoController],
})
export class PublicoModule {}
