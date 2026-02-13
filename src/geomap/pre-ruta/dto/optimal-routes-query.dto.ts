import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OptimalRoutesQueryDto {
  @ApiProperty({ example: '2025-01-01', description: 'Fecha de las rutas (YYYY-MM-DD)' })
  @IsDateString()
  fecha: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del área (opcional, 0 o vacío = todas)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  area_id?: number;
}
