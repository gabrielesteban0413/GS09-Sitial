import { Type } from 'class-transformer';
import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const LOCATION_CATEGORIES = [
  'restaurante',
  'cafeteria',
  'panaderia',
  'bar',
  'gimnasio',
  'farmacia',
  'supermercado',
  'tienda',
  'oficina',
  'otro',
];

export class CreateLocationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsIn(LOCATION_CATEGORIES)
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;
}
