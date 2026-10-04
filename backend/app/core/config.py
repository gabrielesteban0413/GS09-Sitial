from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8",
        case_sensitive=False, extra="ignore",
    )

    app_name: str = "Sitial"
    app_env: Literal["development", "staging", "production"] = "production"
    app_debug: bool = False
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    secret_key: str = Field(..., min_length=32)
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"
    google_maps_api_key: str = Field(...)
    google_maps_timeout: float = 10.0
    google_maps_cache_ttl: int = 3600
    database_url: str = Field(...)
    redis_url: str = Field(...)
    cors_origins: list[str] = Field(default_factory=list)
    rate_limit_anonymous: str = "20/minute"
    rate_limit_authenticated: str = "200/minute"
    log_level: str = "INFO"
    log_format: Literal["json", "console"] = "json"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [o.strip() for o in value.split(",") if o.strip()]
        if isinstance(value, list):
            return value
        return []


@lru_cache
def get_settings() -> Settings:
    return Settings()
