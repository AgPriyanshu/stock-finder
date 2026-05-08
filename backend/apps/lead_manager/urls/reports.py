from django.urls import path

from ..views.reports import ReportCreateView

urlpatterns = [
    path("", ReportCreateView.as_view(), name="sf-report-create"),
]
