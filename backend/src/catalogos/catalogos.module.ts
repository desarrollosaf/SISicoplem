import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Licitacion } from '../database/models/licitacion.model';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { CatalogosController } from './catalogos.controller';

@Module({
  imports: [SequelizeModule.forFeature([Licitacion]), JwtAuthModule],
  controllers: [CatalogosController],
})
export class CatalogosModule {}
