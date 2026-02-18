import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { InformixModule } from './common/informix/informix.module';
import { GeomapModule } from './geomap/geomap.module';
import { UranioModule } from './uranio/uranio.module';
import { IridioModule } from './iridio/iridio.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    InformixModule,
    GeomapModule,
    UranioModule,
    IridioModule,
    ProveedoresModule,
  ],
})
export class AppModule {}
