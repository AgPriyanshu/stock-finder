from rest_framework.views import exception_handler


def envelope_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return None

    # Extract a human-readable message from the DRF error structure.
    detail = response.data
    if isinstance(detail, dict):
        message = str(detail.get("detail", ""))
        # Field-level validation errors — collect first message per field.
        if not message:
            parts = []
            for field, errors in detail.items():
                first = errors[0] if isinstance(errors, list) and errors else errors
                parts.append(f"{field}: {first}")
            message = "; ".join(parts)
    elif isinstance(detail, list):
        message = str(detail[0]) if detail else ""
    else:
        message = str(detail)

    response.data = {
        "meta": {
            "status_code": response.status_code,
            "success": False,
            "message": message,
        },
        "data": None,
    }

    return response
