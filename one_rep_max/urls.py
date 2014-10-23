from django.conf.urls import patterns, url

from .basic_navigation.views import home
from .basic_navigation import api

urlpatterns = patterns('',
    url(r'^$', home, name='home'),
    url(r'^api/upload_video', api.upload_video, name="upload-video"),
    url(r'^api/login', api.login, name="login"),
    url(r'^api/logout', api.login, name="logout"),
    url(r'^api/submit_order', api.submit_order, name="submit-order"),
    url(r'^api/user_info/', api.user_info, name='user-info')
)
