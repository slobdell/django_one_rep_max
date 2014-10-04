from django.conf.urls import patterns, url
from django.conf import settings

from .basic_navigation.views import home

urlpatterns = patterns('',
    url(r'^$', home, name='home'),
)
