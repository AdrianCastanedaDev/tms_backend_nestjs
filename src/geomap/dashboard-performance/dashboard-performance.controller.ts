import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardPerformanceService } from './dashboard-performance.service';
import {
  FilterPerformanceMainDto,
  FilterPerformanceDashDto,
} from './dto/filter-performance.dto';
import { DetailPerformanceDto } from './dto/detail-performance.dto';
import { ActivitiesPerformanceDto } from './dto/activities-performance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Geomap / Dashboard Performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('geomap/dashboard-performance')
export class DashboardPerformanceController {
  constructor(private readonly service: DashboardPerformanceService) {}

  @Post('list')
  @ApiOperation({ summary: 'Listado principal de performance por usuarios' })
  listPerformance(@Body() dto: FilterPerformanceMainDto) {
    return this.service.getPerformanceByUsers(dto);
  }

  @Post('detail')
  @ApiOperation({ summary: 'Detalle de performance por usuario' })
  detailPerformance(@Body() dto: DetailPerformanceDto) {
    return this.service.getDetailPerformanceByUser(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Lista de usuarios' })
  listUsers() {
    return this.service.getListUsers();
  }

  @Post('activities')
  @ApiOperation({ summary: 'Actividades por usuario' })
  listActivities(@Body() dto: ActivitiesPerformanceDto) {
    return this.service.getActivitiesByUser(dto);
  }

  @Post('georef-data')
  @ApiOperation({ summary: 'Datos georef lineal' })
  georefData(@Body() dto: FilterPerformanceDashDto) {
    return this.service.getGeorefData(dto);
  }

  @Post('personal-door-data')
  @ApiOperation({ summary: 'Datos personal puerta' })
  personalDoorData(@Body() dto: FilterPerformanceDashDto) {
    return this.service.getPersonalDoorData(dto);
  }

  @Post('timeline-data')
  @ApiOperation({ summary: 'Datos timeline' })
  timelineData(@Body() dto: FilterPerformanceDashDto) {
    return this.service.getTimelineData(dto);
  }
}
