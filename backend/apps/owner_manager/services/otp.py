import logging

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework.exceptions import PermissionDenied, ValidationError

logger = logging.getLogger(__name__)

OTP_TTL_SECONDS = 300
PHONE_RATE_TTL_SECONDS = 60
IP_RATE_TTL_SECONDS = 3600
IP_RATE_MAX = 10

_2FACTOR_BASE = "https://2factor.in/API/V1"


def _session_key(phone: str) -> str:
    return f"sf:otp:session:{phone}"


def _phone_rate_key(phone: str) -> str:
    return f"sf:otp:rate:phone:{phone}"


def _ip_rate_key(ip: str) -> str:
    return f"sf:otp:rate:ip:{ip}"


def _check_rate_limits(phone: str, ip: str | None) -> None:
    if cache.get(_phone_rate_key(phone)):
        raise PermissionDenied("Please wait before requesting another OTP.")

    if ip:
        key = _ip_rate_key(ip)
        cache.add(key, 0, IP_RATE_TTL_SECONDS)
        try:
            count = cache.incr(key)
        except ValueError:
            cache.set(key, 1, IP_RATE_TTL_SECONDS)
            count = 1

        if count > IP_RATE_MAX:
            raise PermissionDenied("Too many OTP requests from this IP.")


def _send_via_2factor(phone: str) -> str:
    """Send OTP via 2Factor and return the session ID.

    In dev (no API key) logs a fixed dev OTP and returns a sentinel session ID.
    """
    if not settings.TWOFACTOR_API_KEY:
        dev_otp = "123456"
        logger.warning("2Factor not configured — dev OTP for %s is %s", phone, dev_otp)
        # Store the plaintext OTP so verify can check it without an API call.
        return f"dev:{dev_otp}"

    # Strip leading '+' — 2Factor expects digits only (e.g. 919876543210).
    digits = phone.lstrip("+")
    url = f"{_2FACTOR_BASE}/{settings.TWOFACTOR_API_KEY}/SMS/{digits}/AUTOGEN"

    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
    except requests.RequestException as exc:
        logger.exception("2Factor send failed for %s: %s", phone, exc)
        raise ValidationError("Could not send OTP, please retry.") from exc

    if data.get("Status") != "Success":
        logger.error("2Factor returned non-success for %s: %s", phone, data)
        raise ValidationError("Could not send OTP, please retry.")

    return data["Details"]  # session ID


def request_otp(phone: str, ip: str | None = None) -> None:
    _check_rate_limits(phone, ip)

    session_id = _send_via_2factor(phone)
    cache.set(_session_key(phone), session_id, OTP_TTL_SECONDS)
    cache.set(_phone_rate_key(phone), 1, PHONE_RATE_TTL_SECONDS)


def verify_otp(phone: str, submitted: str) -> bool:
    session_id = cache.get(_session_key(phone))

    if not session_id:
        raise ValidationError("OTP expired or not requested.")

    # Dev mode: session_id is "dev:<otp>", verify locally.
    if session_id.startswith("dev:"):
        expected = session_id[len("dev:"):]
        if submitted != expected:
            raise ValidationError("Incorrect OTP.")
        cache.delete(_session_key(phone))
        return True

    url = f"{_2FACTOR_BASE}/{settings.TWOFACTOR_API_KEY}/SMS/VERIFY/{session_id}/{submitted}"

    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
    except requests.RequestException as exc:
        logger.exception("2Factor verify failed for %s: %s", phone, exc)
        raise ValidationError("Could not verify OTP, please retry.") from exc

    if data.get("Status") != "Success" or data.get("Details") != "OTP Matched":
        raise ValidationError("Incorrect OTP.")

    cache.delete(_session_key(phone))
    return True
