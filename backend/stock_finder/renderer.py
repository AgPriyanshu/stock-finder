import json

from django.contrib.gis.geos import GEOSGeometry
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from rest_framework.utils.encoders import JSONEncoder


class GeoJSONEncoder(JSONEncoder):
    """Extends DRF's JSONEncoder to serialize GEOSGeometry as GeoJSON dicts."""

    def default(self, obj):
        if isinstance(obj, GEOSGeometry):
            return json.loads(obj.json)
        return super().default(obj)


class CustomJSONRenderer(JSONRenderer):
    charset = "utf-8"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None

        if response and response.status_code == status.HTTP_204_NO_CONTENT:
            return b""

        # Views already return a fully-formed envelope {"meta": {...}, "data": ...}.
        # Pass it straight through so the message and data are not lost.
        if isinstance(data, dict) and "meta" in data and "data" in data:
            return json.dumps(data, cls=GeoJSONEncoder, ensure_ascii=False)

        # Bare DRF error responses (e.g. from the exception handler or
        # third-party middleware) only have "detail" at the top level.
        message = ""
        if isinstance(data, dict):
            message = str(data.pop("detail", ""))
            response_data_body = data.get("data", data)
        else:
            response_data_body = data

        response_data = {
            "meta": {
                "status_code": response.status_code if response else status.HTTP_200_OK,
                "success": (response.status_code < status.HTTP_400_BAD_REQUEST) if response else True,
                "message": message,
            },
            "data": response_data_body,
        }

        return json.dumps(response_data, cls=GeoJSONEncoder, ensure_ascii=False)
