import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from './dto/login-auth.dto';
import { JwtPayload } from './Interfaces/jwt-payload.interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User, 'dataConnection')
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  //User Login Service
  async login(loginUserDto: LoginUserDto) {
    const { contrasena, usuario } = loginUserDto;

    console.log(contrasena, usuario);

    const user = await this.userRepository.findOne({
      where: { usuario },
      select: { pk1: true, usuario: true, contrasena: true, inspector: true },
    });

    if (!user)
      throw new UnauthorizedException(
        'Credentials are not valid (no_empleado)',
      );

    if (contrasena !== user.contrasena) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    /*   if (!bcrypt.compareSync(contrasena, user.contrasena)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    } */

    return {
      ...user,
      token: this.getJwtToken({
        inspector: user.inspector,
      }),
    };
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private getJwtToken(payload: JwtPayload) {
    //Para generar el token debemos usar un servicio llamado JwtService
    const token = this.jwtService.sign(payload);
    return token;
  }
}
