import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, Max, Min, ValidateNested } from "class-validator";

class CoordinatesDto {
  @IsNumber() @Min(-90) @Max(90) lat: number;
  @IsNumber() @Min(-180) @Max(180) lng: number;
}

export class SearchCompetitorsDto {
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @IsInt() @Min(100) @Max(5000)
  radiusMeters: number;

  @IsIn(["cafe", "restaurant", "bakery", "pharmacy", "gym", "supermarket"])
  businessType: string;
}
