from rest_framework.throttling import SimpleRateThrottle


class _AnonOnlyThrottle(SimpleRateThrottle):
    """Base: only counts unauthenticated requests."""

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class _AuthOnlyThrottle(SimpleRateThrottle):
    """Base: only counts authenticated requests."""

    def get_cache_key(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return None
        return self.cache_format % {"scope": self.scope, "ident": request.user.pk}


class SearchAnonThrottle(_AnonOnlyThrottle):
    scope = "sf_search_anon"


class SearchUserThrottle(_AuthOnlyThrottle):
    scope = "sf_search_auth"


class LeadAnonThrottle(_AnonOnlyThrottle):
    scope = "sf_lead_anon"


class LeadUserThrottle(_AuthOnlyThrottle):
    scope = "sf_lead_auth"
