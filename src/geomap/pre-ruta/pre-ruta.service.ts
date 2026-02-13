import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PreRutaService {
  private readonly logger = new Logger(PreRutaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMachines() {
    return this.prisma.nb_machine.findMany({
      where: { mach_estado: true },
      select: {
        machine_id: true,
        mach_name: true,
      },
      orderBy: { machine_id: 'asc' },
    });
  }

  async getSucursales() {
    return this.prisma.sucursal.findMany({
      where: { suc_estado: true },
      select: {
        sucursal_id: true,
        suc_codigo: true,
        suc_nombre: true,
        tsuc_id: true,
      },
    });
  }

  async getAreas() {
    return this.prisma.areas_ruta.findMany({
      where: { area_estado: true },
      select: {
        area_id: true,
        area_nombre: true,
      },
    });
  }

  async getOptimalRoutes(fecha: string, areaId?: number) {
    const areaFilter = areaId ?? 0;
    this.logger.log(`getOptimalRoutes -> fecha: ${fecha}, areaId: ${areaFilter}`);

    try {
    return await this.prisma.$queryRaw(Prisma.sql`
      SELECT
        c.gru_id,
        c.gru_nombre,
        d.zona_id,
        d.zona_codigo,
        a.rou_id,
        a.area_id,
        CASE
          WHEN COALESCE(e.rou_id, 0) > 0 AND a.rou_status IN (3) THEN '1'
          ELSE '0'
        END AS flag_ruta,
        a.sucursal_id,
        f.ciu_id,
        f.ciu_nombre,
        un.und_placa AS placa,
        COALESCE(pe.per_nombre, '') || ' ' || COALESCE(pe.per_apellido, '') AS courier,
        rou_pza_count AS tot_pza_escrita,
        COUNT(DISTINCT b.rou_poi_id) AS tot_paradas,
        COUNT(DISTINCT b.envio_id) AS tot_guias,
        COUNT(*) AS tot_piezas,
        SUM(pp.pza_peso_v) AS volumen,
        SUM(pp.pza_peso) AS peso,
        COUNT(DISTINCT CASE WHEN COALESCE(rv.scan_valid, false) = true THEN b.envio_id END) AS tot_guias_scan,
        COUNT(CASE WHEN COALESCE(rv.scan_valid, false) = true THEN 1 END) AS tot_piezas_scan,
        ROUND(SUM(CASE WHEN COALESCE(rv.scan_valid, false) = true THEN
          COALESCE(pza_alto, 0) * COALESCE(pza_largo, 0) * COALESCE(pza_ancho, 0)
        ELSE 0 END) / 1000000.0, 2) AS volumen_scan,
        SUM(CASE WHEN COALESCE(rv.scan_valid, false) = true THEN pp.pza_peso ELSE 0 END) AS peso_scan,
        COUNT(DISTINCT CASE WHEN COALESCE(rv.scan_valid, false) = true THEN b.rou_poi_id END) AS tot_paradas_scan,
        COALESCE(e.rou_pza_count, 0) AS tot_pza_contadas,
        gis_pre_ruta_listado_xy_ruta(
          json_build_object('rou_id', a.rou_id)::jsonb
        ) AS ruta_xy
      FROM routes a
      INNER JOIN route_delivery b ON b.rou_id = a.rou_id
      INNER JOIN route_point rd ON rd.rou_id = b.rou_id AND rd.rou_poi_id = b.rou_poi_id
      INNER JOIN grupo c ON c.gru_id = a.gru_id
      INNER JOIN zonas d ON d.zona_id = a.zona_id
      INNER JOIN gis_ciudad f ON f.ciu_id = a.ciu_id
      INNER JOIN pieza_peso pp ON pp.pieza_id = b.pieza_id
      LEFT JOIN route_owner e ON e.rou_id = a.rou_id
      LEFT JOIN unidades un ON un.unidad_id = e.und_id
      LEFT JOIN personal pe ON pe.per_id = e.per_id
      LEFT JOIN route_valida rv ON rv.rou_env_id = b.rou_env_id
      WHERE a.rou_status != 0
        AND (${areaFilter} = 0 OR a.area_id = ${areaFilter})
        AND rou_fecha = ${fecha}::date
        AND d.zona_estado IS TRUE
      GROUP BY
        c.gru_id, c.gru_nombre, d.zona_id, d.zona_codigo,
        a.rou_id, a.area_id, a.rou_status, a.sucursal_id, a.rou_pza_count,
        f.ciu_id, f.ciu_nombre, un.und_placa,
        pe.per_nombre, pe.per_apellido, e.rou_id, e.rou_pza_count
      ORDER BY c.gru_nombre, a.rou_id, f.ciu_nombre
    `);
    } catch (error) {
      this.logger.error(`getOptimalRoutes -> ${error.message}`);
      throw error;
    }
  }
}
