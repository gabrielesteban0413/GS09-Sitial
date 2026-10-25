import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("GOOGLE_MAPS_API_KEY")?.trim() ?? "";
  }

  async geocodeAddress(address: string) {
    if (!this.apiKey) {
      throw new ServiceUnavailableException("Falta configurar GOOGLE_MAPS_API_KEY en backend/.env");
    }

    const query = new URLSearchParams({
      address,
      components: "country:CO",
      language: "es",
      region: "co",
      key: this.apiKey,
    });
    const data = await this.fetchGeocode(query);
    if (data.status === "ZERO_RESULTS") {
      throw new NotFoundException("No se encontró la dirección. Intenta con otra búsqueda.");
    }
    if (data.status !== "OK" || !data.results?.[0]) {
      throw new ServiceUnavailableException(data.error_message ?? `Geocoding status: ${data.status}`);
    }

    const match = data.results[0];
    return {
      coordinates: {
        lat: match.geometry.location.lat,
        lng: match.geometry.location.lng,
      },
      formattedAddress: match.formatted_address,
    };
  }

  async validateLandCoordinates(lat: number, lng: number) {
    if (!this.apiKey) {
      throw new ServiceUnavailableException("Falta configurar GOOGLE_MAPS_API_KEY en backend/.env");
    }

    const query = new URLSearchParams({
      latlng: `${lat},${lng}`,
      language: "es",
      key: this.apiKey,
    });
    const data = await this.fetchGeocode(query);
    if (data.status !== "OK") {
      throw new BadRequestException(
        "No se pudo confirmar que la ubicación esté en tierra firme. Selecciona un punto sobre una dirección o establecimiento.",
      );
    }

    const landTypes = new Set([
      "street_address",
      "street_number",
      "route",
      "premise",
      "subpremise",
      "establishment",
      "point_of_interest",
      "park",
      "neighborhood",
      "sublocality",
      "locality",
      "postal_town",
      "administrative_area_level_3",
      "administrative_area_level_2",
      "administrative_area_level_1",
    ]);
    const result = data.results.find((candidate: { types?: string[] }) =>
      candidate.types?.some((type) => landTypes.has(type)),
    );

    if (!result) {
      throw new BadRequestException(
        "La ubicación parece estar en el agua o no corresponde a un sitio terrestre identificable. Selecciona un punto en tierra firme.",
      );
    }

    return result;
  }

  async reverseGeocode(lat: number, lng: number) {
    const query = new URLSearchParams({
      latlng: `${lat},${lng}`,
      language: "es",
      key: this.apiKey,
    });
    return this.fetchGeocode(query);
  }

  private async fetchGeocode(query: URLSearchParams) {
    let response: Response;
    try {
      response = await fetch(`${GEOCODE_URL}?${query.toString()}`);
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : "Unknown network error";
      throw new ServiceUnavailableException(`Geocoding could not be reached: ${reason}`);
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(`Geocoding returned ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new ServiceUnavailableException(data.error_message ?? `Status: ${data.status}`);
    }
    return data;
  }

  async nearbySearch(lat: number, lng: number, radius: number, type: string) {
    if (!this.apiKey) {
      throw new ServiceUnavailableException("Falta configurar GOOGLE_MAPS_API_KEY en backend/.env");
    }

    const body = {
      includedTypes: [type],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius,
        },
      },
      languageCode: "es",
    };

    let response: Response;
    try {
      response = await fetch(PLACES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.types,places.priceLevel,places.businessStatus",
        },
        body: JSON.stringify(body),
      });
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : "Unknown network error";
      throw new ServiceUnavailableException(`Places API could not be reached: ${reason}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new ServiceUnavailableException(
        `Places API returned ${response.status}: ${errorText.slice(0, 500)}`,
      );
    }

    return response.json();
  }
}