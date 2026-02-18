import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InformixService } from '../../common/informix/informix.service';
import { Prisma } from '../../generated/prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly informix: InformixService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.refreshSecret = this.config.get<string>('KEY_JWT_REFRESH');
  }

  async login(username: string, password: string, ip: string) {
    // SHA1 hash del password (mismo que Python: hashlib.sha1(password.encode()).hexdigest())
    const sha1Password = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    // Paso 1: Autenticar contra Informix
    const ifxResult = await this.informix.executeSp('usr_sis_login', [
      { value: username, type: 'varchar' },
      { value: sha1Password, type: 'varchar' },
      { value: ip, type: 'varchar' },
    ]);

    if (!ifxResult || ifxResult.length === 0) {
      throw new HttpException(
        'Credenciales invalidas',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userData = ifxResult[0];

    if (userData.sql_error < 0) {
      throw new HttpException(
        userData.msn_error || 'Error de autenticacion',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userData.flag_geomap !== '1') {
      throw new HttpException(
        'No cuenta con los permisos',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Paso 2: Sincronizar usuario en PostgreSQL
    const pgPayload = {
      id_user: userData.id_user,
      usr_codigo: userData.usuario,
      nombre: userData.nombre,
      doc_tipo: userData.doc_tipo,
      doc_numero: userData.doc_numero,
      per_nombre: userData.per_nombre,
      per_apellido: userData.per_apellido,
      prov_codigo: userData.prov_codigo,
      per_id: userData.per_id,
      id_socio: userData.id_socio,
      id_cargo: userData.id_cargo,
    };

    // TODO: Reemplazar con lógica Prisma ORM cuando el usuario provea el código SQL del SP
    const pgResults: any[] = await this.prisma.$queryRaw(
      Prisma.sql`SELECT gis_general_login_add_user(${JSON.stringify(pgPayload)}::jsonb) as data`,
    );
    const pgData = this.parseResult(pgResults);
    const idUsuarioPostgre = pgData?.id_usuario ?? pgData?.[0]?.id_usuario;

    // Paso 3: Generar tokens JWT
    const jwtPayload = {
      id_user: userData.id_user,
      usuario: userData.usuario,
      nombre: userData.nombre,
      usr_tipo: userData.usr_tipo,
      id_user_postgre: idUsuarioPostgre,
    };

    const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: '12h' });
    const refreshToken = this.jwtService.sign(
      { sub: jwtPayload, typ: 'refresh' },
      { secret: this.refreshSecret, expiresIn: '1d' },
    );

    return {
      id_user_informix: userData.id_user,
      usuario: userData.usuario,
      nombre: userData.nombre,
      prov_nombre: userData.prov_nombre,
      prov_sigla: userData.prov_sigla,
      per_id: userData.per_id,
      perfil: userData.perfil,
      id_cargo: userData.id_cargo,
      usr_tipo: userData.usr_tipo,
      prov_codigo: userData.prov_codigo,
      time_session: userData.time_session,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      id_user_postgre: idUsuarioPostgre,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      if (decoded.typ !== 'refresh') {
        throw new Error('Not a refresh token');
      }

      const payload = decoded.sub;
      const newAccess = this.jwtService.sign(payload, { expiresIn: '12h' });
      const newRefresh = this.jwtService.sign(
        { sub: payload, typ: 'refresh' },
        { secret: this.refreshSecret, expiresIn: '1d' },
      );

      return {
        access_token: newAccess,
        refresh_token: newRefresh,
        token_type: 'bearer',
      };
    } catch {
      throw new HttpException(
        'Refresh token invalido o expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  validateToken(user: any) {
    return { message: 'Acceso autorizado', datos_usuario: user };
  }

  private parseResult(results: any[]): any {
    const parsed = JSON.parse(
      JSON.stringify(results, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
    if (parsed.length > 0 && parsed[0].data) {
      return typeof parsed[0].data === 'string'
        ? JSON.parse(parsed[0].data)
        : parsed[0].data;
    }
    return parsed[0];
  }
}
