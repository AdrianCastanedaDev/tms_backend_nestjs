import { Module } from '@nestjs/common';
import { PreRutaModule } from './pre-ruta/pre-ruta.module';
import { AuthModule } from './auth/auth.module';
import { DashboardPerformanceModule } from './dashboard-performance/dashboard-performance.module';

@Module({
  imports: [PreRutaModule, AuthModule, DashboardPerformanceModule],
})
export class GeomapModule {}
