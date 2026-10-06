import { createHash } from "crypto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DemographicService {
  profile(lat: number, lng: number) {
    const seed = this.seed(lat, lng);
    return {
      populationDensity: 12000 + Math.floor(seed * 18000),
      medianAge: 28 + Math.floor(seed * 12),
      medianIncomeUsd: 800 + Math.floor(seed * 2400),
      householdSize: Math.round((2.5 + seed * 1.5) * 10) / 10,
      collegeEducatedPct: 25 + Math.floor(seed * 45),
    };
  }

  private seed(lat: number, lng: number): number {
    const raw = `${lat.toFixed(6)}:${lng.toFixed(6)}`;
    const hash = createHash("sha256").update(raw).digest();
    const n = hash.readUInt32BE(0);
    return (n % 10000) / 10000;
  }
}
