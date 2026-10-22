import { IsNotEmpty, IsString } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @IsString()
  @IsNotEmpty()
  new_password_confirmation: string;
}
