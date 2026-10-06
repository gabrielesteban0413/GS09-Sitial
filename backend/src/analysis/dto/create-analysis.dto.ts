import { Type } from "class-transformer";
import {
  IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString,
  Max, MaxLength, Min, ValidateNested,
} from "class-validator";

class CoordinatesDto {
  @IsNumber() @Min(-90) @Max(90) lat: number;
  @IsNumber() @Min(-180) @Max(180) lng: number;
}

class WeightsDto {
  @IsInt() @Min(0) @Max(100) footTraffic: number;
  @IsInt() @Min(0) @Max(100) competition: number;
  @IsInt() @Min(0) @Max(100) demographics: number;
  @IsInt() @Min(0) @Max(100) accessibility: number;
}

export class CreateAnalysisDto {
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @IsIn(["cafe", "restaurant", "bakery", "pharmacy", "gym", "supermarket"])
  businessType: string;

  @IsInt() @Min(100) @Max(5000)
  radiusMeters: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => WeightsDto)
  weights?: WeightsDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}
