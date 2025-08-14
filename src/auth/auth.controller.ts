import { Controller, Body, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MessagePattern, Payload } from '@nestjs/microservices';
//@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //@Post('register')
  //@ApiBody({ type: RegisterDto })
  @MessagePattern({cmd: 'register'})
  async register(@Payload() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  //@Post('login')
  //@ApiBody({ type: LoginDto })
  @MessagePattern({cmd: 'login'})
  async login(@Payload() loginDto: LoginDto) {
    return await this.authService.login(loginDto)
  }
  
  //@Post('refresh')
  //@ApiBody({ schema: { example: { refresh_token: '...' } } })
  @MessagePattern({cmd: 'refresh'})
  refresh(@Payload() body: { refresh_token: string }) {
    return this.authService.refresh(body.refresh_token);
  }

  //@Post('logout')
  //@ApiBearerAuth()
  @MessagePattern({cmd: 'logout'})
  @UseGuards(JwtAuthGuard)
  logout(@Payload() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }
}
