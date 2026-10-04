from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class Address(BaseModel):
    formatted: str
    street: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None
    postal_code: str | None = None


class GeocodeRequest(BaseModel):
    address: str = Field(..., min_length=3, max_length=500)


class GeocodeResponse(BaseModel):
    coordinates: Coordinates
    address: Address
    place_id: str
