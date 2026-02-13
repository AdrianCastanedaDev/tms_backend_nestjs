import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PreRutaService } from './pre-ruta.service';
import { OptimalRoutesQueryDto } from './dto/optimal-routes-query.dto';

@ApiTags('Geomap / Pre Ruta')
@Controller('geomap/pre-ruta')
export class PreRutaController {
  constructor(private readonly preRutaService: PreRutaService) {}

  @Get('machines')
  @ApiOperation({ summary: 'Listar máquinas activas' })
  getMachines() {
    return this.preRutaService.getMachines();
  }

  @Get('sucursales')
  @ApiOperation({ summary: 'Listar sucursales activas' })
  getSucursales() {
    return this.preRutaService.getSucursales();
  }

  @Get('areas')
  @ApiOperation({ summary: 'Listar áreas activas' })
  getAreas() {
    return this.preRutaService.getAreas();
  }

  @Get('optimal-routes')
  @ApiOperation({ summary: 'Listar rutas óptimas por fecha' })
  getOptimalRoutes(@Query() query: OptimalRoutesQueryDto) {
    return this.preRutaService.getOptimalRoutes(query.fecha, query.area_id);
  }
}
