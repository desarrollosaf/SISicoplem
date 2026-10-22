import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { JwtAuthModule } from './jwt-auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [SequelizeModule.forFeature([User]), JwtAuthModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtAuthModule],
})
export class AuthModule {}
