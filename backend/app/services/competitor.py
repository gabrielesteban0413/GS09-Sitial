import math

from app.clients.google_maps import GoogleMapsClient
from app.schemas.competitor import (
    Competitor, CompetitorSearchRequest, CompetitorSearchResponse, ThreatLevel,
)
from app.schemas.location import Coordinates

BUSINESS_TYPE_MAP = {
    "cafe": "cafe", "restaurant": "restaurant", "bakery": "bakery",
    "pharmacy": "pharmacy", "gym": "gym", "supermarket": "supermarket",
}


class CompetitorService:
    def __init__(self, client: GoogleMapsClient) -> None:
        self._client = client

    async def search(self, request: CompetitorSearchRequest) -> CompetitorSearchResponse:
        gt = BUSINESS_TYPE_MAP.get(request.business_type, request.business_type)
        data = await self._client.nearby_search(
            request.coordinates.lat, request.coordinates.lng,
            request.radius_meters, gt,
        )
        results = data.get("results", [])
        competitors = [self._build(item, request.coordinates) for item in results[:20]]
        competitors.sort(key=lambda c: c.distance_meters)
        return CompetitorSearchResponse(
            center=request.coordinates,
            radius_meters=request.radius_meters,
            total=len(competitors),
            competitors=competitors,
        )

    @staticmethod
    def _build(item: dict, origin: Coordinates) -> Competitor:
        loc = item["geometry"]["location"]
        coords = Coordinates(lat=loc["lat"], lng=loc["lng"])
        distance = int(CompetitorService._haversine(origin, coords))
        rating = item.get("rating")
        reviews = item.get("user_ratings_total", 0)
        return Competitor(
            place_id=item.get("place_id", ""),
            name=item.get("name", "Unknown"),
            category=(item.get("types") or ["unknown"])[0],
            coordinates=coords,
            distance_meters=distance,
            rating=rating,
            review_count=reviews,
            threat_level=CompetitorService._threat(rating, reviews, distance),
            price_level=item.get("price_level"),
            business_status=item.get("business_status"),
        )

    @staticmethod
    def _threat(rating: float | None, reviews: int, distance: int) -> ThreatLevel:
        if rating is None:
            return ThreatLevel.LOW
        prox = max(0.0, 1.0 - distance / 1000)
        rat = (rating - 3.0) / 2.0
        rev = min(1.0, math.log1p(reviews) / math.log1p(5000))
        score = 0.45 * prox + 0.30 * max(0.0, rat) + 0.25 * rev
        if score >= 0.60:
            return ThreatLevel.HIGH
        if score >= 0.35:
            return ThreatLevel.MEDIUM
        return ThreatLevel.LOW

    @staticmethod
    def _haversine(a: Coordinates, b: Coordinates) -> float:
        R = 6_371_000
        lat1, lat2 = math.radians(a.lat), math.radians(b.lat)
        dlat = math.radians(b.lat - a.lat)
        dlng = math.radians(b.lng - a.lng)
        h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h))
