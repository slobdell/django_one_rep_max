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

        # TODO move this to its own method
        now = datetime.datetime.utcnow()
        if (now - _user.last_login.replace(tzinfo=None)).total_seconds() > 15 * 60.0:
            _user.last_login = datetime.datetime.utcnow()
            _user.save()

        return cls._wrap(_user)

    @classmethod
    def get_by_id(cls, id):
        _user = _User.objects.get(id=id)
        return cls._wrap(_user)

    def update_email(self, email_address):
        if self._user.email != email_address:
            self._user.email = email_address
            self._user.save()

    def update_email_from_facebook(self, facebook_email):
        if self._user.email:
            return
        self._user.email = facebook_email
        self._user.save()

    def add_credits(self, credits_to_add):
        self._user.credits += credits_to_add
        self._user.save()

    @property
    def id(self):
        return self._user.id

    @property
    def facebook_service_id(self):
        return self._user.facebook_service_id

    @property
    def email(self):
        return self._user.email

    def to_json(self):
        return {
            "id": self._user.id,
            "credits": self._user.credits,
            "email": self._user.email
        }
