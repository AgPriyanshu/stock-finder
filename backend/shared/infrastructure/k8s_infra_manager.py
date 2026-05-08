"""
Kubernetes Infrastructure Manager Implementation.

Service instances are created at class definition time, initializing their
clients from environment variables.
"""

from .base import InfraManagerAbstract
from .storage.k8s_object_storage import K8sObjectStorage


class K8sInfraManager(InfraManagerAbstract):
    """
    Kubernetes implementation of the infrastructure manager. Configuration
    is loaded from environment variables (S3_ENDPOINT, S3_ACCESS_KEY, etc.).
    """

    object_storage = K8sObjectStorage()

    def cleanup(self):
        """Clean up resources."""
