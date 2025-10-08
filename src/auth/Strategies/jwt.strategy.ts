import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../Interfaces/jwt-payload.interfaces';

export class JwtStrategy extends PassportStrategy(Strategy) {
  //Para hacer uso de la entidad sera mediante la inyección del repositorio por el constructor
  constructor(
    @InjectRepository(User, 'dataConnection')
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    //Cuando se usa el constructor por defecto el PassportStrategy necesita mandar llamar al padre
    super({
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  //Cuando se tiene un JWT vigente con la fecha de expiración
  //Adicionalmente hace match la firma con el payload
  //Entonces se recibe el payload y se puede validar el payload como se desee

  //Se ejecutara siempre y cuando el token pase las dos validaciones anteriores

  async validate(payload: JwtPayload): Promise<User> {
    const { inspector } = payload;
    //Consultar la tabla de usuarios para verificar la existencia de usuario por el email
    const user = await this.userRepository.findOneBy({ inspector });
    // Si no se encuentra un usuario con email retornamos un error
    if (!user) throw new UnauthorizedException('Token not valid');
    //Si el status del usuario es False, retorna un error
    if (!user.pk1)
      throw new UnauthorizedException('User is inactive, talk with an admin');
    return user;
  }
}
