import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import { User } from './database/models/user.model';
import { Role } from './database/models/role.model';
import { ModelHasRole } from './database/models/model-has-role.model';
import { Licitacion } from './database/models/licitacion.model';
import { Sicoplem } from './database/models/sicoplem.model';
import { DocumentoInformativo } from './database/models/documento-informativo.model';
import { AuthModule } from './auth/auth.module';
import { RegistrosModule } from './registros/registros.module';
import { DocumentosModule } from './documentos/documentos.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { PublicoModule } from './publico/publico.module';

interface MysqlConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): SequelizeModuleOptions => {
        const db = config.get<MysqlConnectionConfig>('database')!;
        return {
          dialect: 'mysql',
          ...db,
          models: [User, Role, ModelHasRole, Licitacion, Sicoplem, DocumentoInformativo],
          synchronize: false,
          timezone: process.env.DB_TIMEZONE ?? '-06:00',
        };
      },
    }),
    AuthModule,
    RegistrosModule,
    DocumentosModule,
    CatalogosModule,
    PublicoModule,
  ],
})
export class AppModule {}
