import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.db import models


class _User(models.Model):
    facebook_service_id = models.CharField(max_length=100)
    credits = models.FloatField()
    email = models.CharField(max_length=255, null=True)
    last_login = models.DateTimeField(null=True)


class User(object):

    def __init__(self, _user):
        self._user = _user

    @classmethod
    def _wrap(cls, _user):
        return User(_user)

    @classmethod
    def get_or_create_from_fb_id(cls, facebook_service_id):
        try:
            _user = _User.objects.get(facebook_service_id=facebook_service_id)
        except ObjectDoesNotExist:
            _user = _User.objects.create(facebook_service_id=facebook_service_id,
                                         credits=0.0)
        _user.last_login = datetime.datetime.utcnow()
        _user.save()
        return cls._wrap(_user)

    @property
    def id(self):
        return self._user.id
