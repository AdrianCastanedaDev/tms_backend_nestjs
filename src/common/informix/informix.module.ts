import { Global, Module } from '@nestjs/common';
import { InformixService } from './informix.service';

@Global()
@Module({
  providers: [InformixService],
  exports: [InformixService],
})
export class InformixModule {}
