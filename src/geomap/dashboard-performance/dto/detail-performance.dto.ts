import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class DetailPerformanceDto {
  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  fecha_ini: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsString()
  fecha_fin: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_user: number;
}
