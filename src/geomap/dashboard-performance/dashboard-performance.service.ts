import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class DashboardPerformanceService {
  private readonly logger = new Logger(DashboardPerformanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // TODO: Convertir estos métodos de llamadas a SP a queries Prisma ORM
  // cuando el usuario provea el código SQL de los stored procedures.
  // Por ahora llaman a los SPs existentes en PostgreSQL via $queryRaw.

  async getPerformanceByUsers(data: any) {
    return this.callSp('gis_dashboard_personal_vista_principal', data);
  }

  async getDetailPerformanceByUser(data: any) {
    return this.callSp('gis_dashboard_personal_vista_personal', data);
  }

  async getListUsers() {
    return this.callSp('gis_general_lista_usuarios');
  }

  async getActivitiesByUser(data: any) {
    return this.callSp('gis_dashboard_personal_vista_personal_actividad', data);
  }

  async getGeorefData(data: any) {
    return this.callSp(
      'gis_dashboard_personal_vista_principal_datos_georef_lineal',
      data,
    );
  }

  async getPersonalDoorData(data: any) {
    return this.callSp(
      'gis_dashboard_personal_vista_principal_datos_personal_puerta',
      data,
    );
  }

  async getTimelineData(data: any) {
    return this.callSp(
      'gis_dashboard_personal_vista_principal_datos_timeline',
      data,
    );
  }

  private async callSp(spName: string, data?: any) {
    try {
      let results: any[];

      if (data !== undefined) {
        results = await this.prisma.$queryRawUnsafe(
          `SELECT ${spName}($1::jsonb) as data`,
          JSON.stringify(data),
        );
      } else {
        results = await this.prisma.$queryRawUnsafe(
          `SELECT ${spName}() as data`,
        );
      }

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

      return parsed;
    } catch (error) {
      this.logger.error(`${spName} -> ${error.message}`, error.stack);
      throw error;
    }
  }
}
