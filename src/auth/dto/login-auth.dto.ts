import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  usuario: string;

  @IsString()
  contrasena: string;
}
