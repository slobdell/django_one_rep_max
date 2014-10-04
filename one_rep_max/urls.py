from django.conf.urls import patterns, url
# from django.conf import settings

from .basic_navigation.views import home

urlpatterns = patterns('',
    url(r'^$', home, name='home'),
)
'''
urlpatterns += patterns('',
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
)
'''
