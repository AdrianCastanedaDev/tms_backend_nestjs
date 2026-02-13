import { Module } from '@nestjs/common';
import { PreRutaModule } from './pre-ruta/pre-ruta.module';

@Module({
  imports: [PreRutaModule],
})
export class GeomapModule {}
