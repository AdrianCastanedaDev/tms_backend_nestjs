import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/strategies/jwt.strategy';

@ApiTags('Geomap / Auth')
@Controller('geomap/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login (Informix + PostgreSQL)' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : req.ip;
    return this.authService.login(dto.username, dto.password, ip);
  }

  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar JWT' })
  validateToken(@CurrentUser() user: JwtPayload) {
    return this.authService.validateToken(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refresh_token);
  }
}
