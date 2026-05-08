from rest_framework.views import exception_handler


def envelope_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return None

    detail = response.data
    message = ""

    if isinstance(detail, dict):
        message = str(detail.get("detail", ""))
    elif isinstance(detail, list):
        message = str(detail[0]) if detail else ""
    elif isinstance(detail, str):
        message = detail

    response.data = {
        "meta": {
            "status_code": response.status_code,
            "success": False,
            "message": message,
        },
        "data": detail,
    }

    return response
