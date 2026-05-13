from types import SimpleNamespace

from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission

# Sentinel user object returned by AdminTokenAuthentication.
# DRF checks .is_authenticated for permission decisions; the is_admin_token
# marker lets IsAdminToken distinguish this from a regular JWT user.
_ADMIN_USER = SimpleNamespace(
    is_authenticated=True,
    is_admin_token=True,
    pk=None,
    id=None,
)


class AdminTokenAuthentication(BaseAuthentication):
    """
    Authenticates requests that carry the server-side SF_ADMIN_TOKEN.

    Accepted formats (in priority order):
      X-ADMIN-TOKEN: <token>
      Authorization: Bearer <token>
    """

    def authenticate(self, request):
        token = (
            request.META.get("HTTP_X_ADMIN_TOKEN")
            or self._bearer_token(request)
        )
        if not token:
            return None

        expected = getattr(settings, "SF_ADMIN_TOKEN", "")
        if not expected:
            raise AuthenticationFailed("Admin token is not configured on this server.")

        if token != expected:
            raise AuthenticationFailed("Invalid admin token.")

        return (_ADMIN_USER, token)

    def authenticate_header(self, request):
        return 'Bearer realm="admin"'

    @staticmethod
    def _bearer_token(request):
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        if auth.lower().startswith("bearer "):
            return auth[7:].strip()
        return None


class IsAdminToken(BasePermission):
    """Allows access only to requests authenticated via AdminTokenAuthentication."""

    def has_permission(self, request, view):
        return bool(getattr(request.user, "is_admin_token", False))
