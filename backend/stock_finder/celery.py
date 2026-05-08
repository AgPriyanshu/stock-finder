"""Celery application configuration for stock_finder."""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "stock_finder.settings")

app = Celery("stock_finder")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()
