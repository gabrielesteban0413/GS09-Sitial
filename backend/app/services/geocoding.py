from app.clients.google_maps import GoogleMapsClient
from app.core.exceptions import NotFoundError
from app.schemas.location import Address, Coordinates, GeocodeResponse


class GeocodingService:
    def __init__(self, client: GoogleMapsClient) -> None:
        self._client = client

    async def geocode(self, address: str) -> GeocodeResponse:
        data = await self._client.geocode(address)
        results = data.get("results", [])
        if not results:
            raise NotFoundError("Address not found")

        result = results[0]
        loc = result["geometry"]["location"]
        comps = self._parse(result.get("address_components", []))

        return GeocodeResponse(
            coordinates=Coordinates(lat=loc["lat"], lng=loc["lng"]),
            address=Address(
                formatted=result.get("formatted_address", address),
                street=comps.get("route"),
                city=comps.get("locality"),
                region=comps.get("administrative_area_level_1"),
                country=comps.get("country"),
                postal_code=comps.get("postal_code"),
            ),
            place_id=result["place_id"],
        )

    async def reverse(self, lat: float, lng: float) -> GeocodeResponse:
        data = await self._client.reverse_geocode(lat, lng)
        results = data.get("results", [])
        if not results:
            raise NotFoundError("No address")
        result = results[0]
        comps = self._parse(result.get("address_components", []))
        return GeocodeResponse(
            coordinates=Coordinates(lat=lat, lng=lng),
            address=Address(
                formatted=result.get("formatted_address", ""),
                street=comps.get("route"),
                city=comps.get("locality"),
                region=comps.get("administrative_area_level_1"),
                country=comps.get("country"),
                postal_code=comps.get("postal_code"),
            ),
            place_id=result["place_id"],
        )

    @staticmethod
    def _parse(components: list[dict]) -> dict[str, str]:
        parsed: dict[str, str] = {}
        for c in components:
            for t in c.get("types", []):
                if t not in parsed:
                    parsed[t] = c.get("long_name", "")
        return parsed
