import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Credential } from './entities/credential.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: async () => {
        const { jwt } = envs;
        return {
          secret: jwt.secret,
          signOptions: {
            expiresIn: jwt.expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
