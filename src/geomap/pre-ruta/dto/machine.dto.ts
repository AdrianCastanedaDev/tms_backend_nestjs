import { ApiProperty } from '@nestjs/swagger';

export class MachineDto {
  @ApiProperty({ example: 1 })
  machineId: number;

  @ApiProperty({ example: 'Máquina 01' })
  machName: string;
}
