import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  id_user: number;
  usuario: string;
  nombre: string;
  usr_tipo: string;
  id_user_postgre: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('KEY_JWT'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.id_user) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
