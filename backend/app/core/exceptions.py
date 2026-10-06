from typing import Any


class SitialError(Exception):
    status_code: int = 500
    error_code: str = "internal_error"
    message: str = "Internal server error"

    def __init__(self, message: str | None = None,
                 error_code: str | None = None,
                 details: dict[str, Any] | None = None) -> None:
        self.message = message or self.message
        self.error_code = error_code or self.error_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(SitialError):
    status_code = 404
    error_code = "not_found"
    message = "Resource not found"


class ValidationError(SitialError):
    status_code = 422
    error_code = "validation_error"


class AuthenticationError(SitialError):
    status_code = 401
    error_code = "authentication_error"


class ConflictError(SitialError):
    status_code = 409
    error_code = "conflict"


class ExternalServiceError(SitialError):
    status_code = 502
    error_code = "external_service_error"


class GoogleMapsError(ExternalServiceError):
    error_code = "google_maps_error"
