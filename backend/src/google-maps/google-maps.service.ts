import { Injectable, ServiceUnavailableException } from "@nestjs/common";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

@Injectable()
export class GoogleMapsService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

  async reverseGeocode(lat: number, lng: number) {
    const query = new URLSearchParams({
      latlng: `${lat},${lng}`,
      language: "es",
      key: this.apiKey,
    });
    const response = await fetch(`${GEOCODE_URL}?${query.toString()}`);
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

    const response = await fetch(PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.types,places.priceLevel,places.businessStatus",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ServiceUnavailableException(`Places API returned ${response.status}: ${errorText}`);
    }

    return response.json();
  }
}