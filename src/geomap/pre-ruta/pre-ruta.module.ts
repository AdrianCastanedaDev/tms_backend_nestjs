import { Module } from '@nestjs/common';
import { PreRutaController } from './pre-ruta.controller';
import { PreRutaService } from './pre-ruta.service';

@Module({
  controllers: [PreRutaController],
  providers: [PreRutaService],
})
export class PreRutaModule {}
