from django.urls import path

from ..views.leads import LeadCreateView, LeadInboxView, LeadMarkContactedView

urlpatterns = [
    path("", LeadCreateView.as_view(), name="sf-lead-create"),
    path("inbox/", LeadInboxView.as_view(), name="sf-lead-inbox"),
    path("<uuid:pk>/contacted/", LeadMarkContactedView.as_view(), name="sf-lead-contacted"),
]
