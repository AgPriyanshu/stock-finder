from django.urls import path

from ..views.analytics import AnalyticsView

urlpatterns = [
    path("", AnalyticsView.as_view(), name="sf-analytics"),
]
