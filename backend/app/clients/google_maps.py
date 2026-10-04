from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import Settings
from app.core.exceptions import GoogleMapsError

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"


class GoogleMapsClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "GoogleMapsClient":
        self._client = httpx.AsyncClient(
            timeout=self._settings.google_maps_timeout,
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
        )
        return self

    async def __aexit__(self, *_: object) -> None:
        if self._client:
            await self._client.aclose()

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("GoogleMapsClient used outside context manager")
        return self._client

    @retry(stop=stop_after_attempt(3),
           wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
           retry=retry_if_exception_type(httpx.TransportError),
           reraise=True)
    async def _request(self, url: str, params: dict[str, Any]) -> dict[str, Any]:
        client = self._ensure_client()
        params["key"] = self._settings.google_maps_api_key
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise GoogleMapsError(f"Upstream {exc.response.status_code}") from exc
        except httpx.TransportError as exc:
            raise GoogleMapsError("Transport error") from exc

        data = response.json()
        status = data.get("status")
        if status not in ("OK", "ZERO_RESULTS"):
            raise GoogleMapsError(data.get("error_message", f"Status: {status}"))
        return data

    async def geocode(self, address: str) -> dict[str, Any]:
        return await self._request(GEOCODE_URL, {"address": address, "language": "es"})

    async def reverse_geocode(self, lat: float, lng: float) -> dict[str, Any]:
        return await self._request(GEOCODE_URL, {"latlng": f"{lat},{lng}", "language": "es"})

    async def nearby_search(self, lat: float, lng: float, radius: int, place_type: str):
        return await self._request(PLACES_NEARBY_URL, {
            "location": f"{lat},{lng}", "radius": radius,
            "type": place_type, "language": "es",
        })
