#!/bin/sh
# Run database migrations.
python manage.py migrate --noinput

# Collect static files into STATIC_ROOT.
python manage.py collectstatic --noinput --clear

# Hand off to the CMD (uvicorn or celery worker).
exec "$@"
