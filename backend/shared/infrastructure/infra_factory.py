"""
Infrastructure factory for creating provider-specific infrastructure managers.
"""

import os
from typing import Literal

from .base import InfraManagerAbstract

ProviderType = Literal["k8s"]


class InfraManagerFactory:
    """Factory for creating infrastructure managers for different providers."""

    @staticmethod
    def create(
        provider: ProviderType = os.environ.get("INFRA_PROVIDER", "k8s"),
    ) -> InfraManagerAbstract:
        if provider == "k8s":
            from .k8s_infra_manager import K8sInfraManager

            return K8sInfraManager()

        raise ValueError(
            f"Unsupported provider: {provider}. Supported providers: k8s"
        )


# Singleton instance of the infrastructure manager.
InfraManager = InfraManagerFactory.create()
