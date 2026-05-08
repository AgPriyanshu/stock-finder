from abc import ABC
from typing import ClassVar

from .storage.base import ObjectStorageAbstract


class InfraManagerAbstract(ABC):
    """
    Abstract base class for infrastructure management.

    Concrete implementations must define object_storage as a class variable
    with a service instance.
    """

    object_storage: ClassVar[ObjectStorageAbstract]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)

        if not hasattr(cls, "object_storage"):
            raise TypeError(
                f"{cls.__name__} must define 'object_storage' as a class variable"
            )
