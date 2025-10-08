import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './Strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PassportModule],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User], 'dataConnection'),
    //Definición de la estrategia
    PassportModule.register({ defaultStrategy: 'jwt' }),
    //Configuración del modulo JWT
    JwtModule.registerAsync({
      //Import de ConfigModule el cual nos permite inyectar el ConfigService
      imports: [ConfigModule],
      inject: [ConfigService],
      //Función que se manda llamar cuando se intente registrar de forma asíncrona el modulo
      useFactory: (ConfigService: ConfigService) => {
        return {
          //Llave secreta para firmar los tokens
          secret: ConfigService.get('JWT_SECRET'),
          signOptions: {
            //Tiempo de expiración de los tokens
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
})
export class AuthModule {}
