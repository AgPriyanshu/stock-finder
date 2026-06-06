import uuid

from shared.infrastructure import InfraManager

_CONTENT_TYPE_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def upload_category_image(category_id, file, content_type: str) -> str:
    ext = _CONTENT_TYPE_TO_EXT.get(content_type, "jpg")
    key = f"stock-finder/categories/{category_id}/cover/{uuid.uuid4()}.{ext}"
    InfraManager.object_storage.upload_object(file=file, key=key, metadata={"content-type": content_type})
    return key
