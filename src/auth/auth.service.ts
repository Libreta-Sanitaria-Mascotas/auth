import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';

import { envs } from '../config';
import { Credential } from './entities/credential.entity';
import { RegisterDto, LoginDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly jwtService: JwtService,
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
  ) { }

  async register(data: RegisterDto) {
    try {
      const { jwt } = envs;

      const existing = await this.credentialRepository.findOne({
        where: { email: data.email },
      });

      if (existing) throw new ConflictException('El correo ya existe');

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const credential = this.credentialRepository.create({
        email: data.email,
        password: hashedPassword,
      });

      const saved = await this.credentialRepository.save(credential);

      const access_token = await this.jwtService.signAsync(
        { id: saved.id, email: saved.email },
        { expiresIn: jwt.expiresIn },
      );

      const refresh_token = await this.jwtService.signAsync(
        { id: saved.id, email: saved.email },
        { expiresIn: jwt.expiresInRefresh },
      );

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error('[AuthService Error]', error);
      throw error instanceof ConflictException
        ? new RpcException({ statusCode: error.getStatus(), message: error.message })
        : new RpcException({ statusCode: 500, message: 'No se pudo registrar el usuario' });
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.credentialRepository.findOne({
        where: {
          email: loginDto.email,
        },
      });

      if (!user) throw new UnauthorizedException('Credenciales inválidas');

      const valid = await bcrypt.compare(loginDto.password, user.password);

      if (!valid) throw new UnauthorizedException('Credenciales inválidas');

      const payload: JwtPayload = { id: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);
      const refresh_token = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      // Guardar en Redis con TTL (7 días = 604800 segundos)
      await this.cacheManager.set(
        `refresh_token:${user.id}`,
        refresh_token,
        604800,
      );

      return { access_token, refresh_token };
    } catch (error) {
      console.error('[AuthService Error]', error);
      throw error instanceof UnauthorizedException
        ? new RpcException({ statusCode: error.getStatus(), message: error.message })
        : new RpcException({ statusCode: 500, message: 'No se pudo actualizar el token' });
    }
  }

  async refresh(refreshToken: string) {
    try {
      const { jwt } = envs;
      let payload: JwtPayload | null = null;
      try {
        payload = await this.jwtService.verifyAsync(refreshToken)
      } catch (error) {
        throw new UnauthorizedException('Token inválido');
      }

      if (!payload) throw new UnauthorizedException('Token inválido');

      const storedToken = await this.cacheManager.get<string>(
        `refresh_token:${payload.id}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Token inválido');
      }

      const newAccessToken = await this.jwtService.signAsync(
        { id: payload.id, email: payload.email },
        { expiresIn: jwt.expiresIn },
      );

      return { access_token: newAccessToken };
    } catch (error) {
      console.error('[Refresh Error]', error);
      throw error instanceof UnauthorizedException
        ? new RpcException({ statusCode: error.getStatus(), message: error.message })
        : new RpcException({ statusCode: 500, message: 'No se pudo actualizar el token' });
    }
  }

  async logout(userId: string) {
    try {
      await this.cacheManager.del(`refresh_token:${userId}`);
      return { message: 'Sesión cerrada correctamente' };
    } catch (error) {
      console.error('[Logout Error]', error);
      throw new RpcException({ statusCode: 500, message: 'No se pudo cerrar sesión' });
    }
  }
}