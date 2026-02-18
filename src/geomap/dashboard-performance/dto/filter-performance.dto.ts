import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class UserIdDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_user: number;
}

export class FilterPerformanceMainDto {
  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  fecha_ini: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsString()
  fecha_fin: string;

  @ApiProperty({ type: [UserIdDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserIdDto)
  usuarios: UserIdDto[];
}

export class FilterPerformanceDashDto {
  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  fecha_ini: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsString()
  fecha_fin: string;

  @ApiProperty({ type: [UserIdDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserIdDto)
  usuarios: UserIdDto[];
}
