import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class ActivitiesPerformanceDto {
  @ApiProperty({ example: '2025-01-15' })
  @IsString()
  fecha: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_user: number;
}
