import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { GeomapModule } from './geomap/geomap.module';
import { UranioModule } from './uranio/uranio.module';
import { IridioModule } from './iridio/iridio.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GeomapModule,
    UranioModule,
    IridioModule,
    ProveedoresModule,
    RouterModule.register([
      { path: 'geomap', module: GeomapModule },
      { path: 'uranio', module: UranioModule },
      { path: 'iridio', module: IridioModule },
      { path: 'proveedores', module: ProveedoresModule },
    ]),
  ],
})
export class AppModule {}
