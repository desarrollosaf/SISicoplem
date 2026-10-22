import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sicoplem } from '../database/models/sicoplem.model';
import { Licitacion } from '../database/models/licitacion.model';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';

@Module({
  imports: [SequelizeModule.forFeature([Sicoplem, Licitacion]), JwtAuthModule],
  controllers: [RegistrosController],
  providers: [RegistrosService],
})
export class RegistrosModule {}
