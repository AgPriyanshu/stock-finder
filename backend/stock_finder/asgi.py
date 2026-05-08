"""
ASGI config for stock_finder project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "stock_finder.settings")

application = get_asgi_application()
