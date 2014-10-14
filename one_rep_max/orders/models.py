import datetime

from django.db import models
from django_richenum.models import LaxIndexEnumField

from one_rep_max.orders.constants import StateType
from one_rep_max.orders.utils import get_dollar_cost_from_video_seconds


class _Order(models.Model):
    user_id = models.IntegerField()
    create_date = models.DateTimeField()
    state = LaxIndexEnumField(StateType, db_column="state_id")
    dollar_cost = models.FloatField(null=True)
    uploaded_video_id = models.IntegerField()


class Order(object):

    def __init__(self, _order):
        self._order = _order

    def _wrap(self, _order):
        return Order(_order)

    @classmethod
    def create_from_uploaded_file(cls, uploaded_file):
        _order = _Order.objects.create(user_id=uploaded_file.user_id,
                                       create_date=datetime.datetime.utcnow(),
                                       state=StateType.QUEUED,
                                       dollar_cost=get_dollar_cost_from_video_seconds(uploaded_file.seconds),
                                       uploaded_video_id=uploaded_file.id)
        return cls._wrap(_order)

    def get_video_url(self):
        # fetch the uploaded video and returns its url
        pass

    def get_user_email(self):
        # fetch the user then return his/her email
        pass

    def _change_state(self, state_type):
        self._order.state = state_type
        self._order.save()

    def change_state_processing(self):
        self._change_state(StateType.PROCESSING)

    def change_state_complete_processing(self):
        self._change_state(StateType.COMPLETE_PROCESSING)

    def change_state_failed(self):
        self._change_state(StateType.FAILED)

    def change_state_user_notified(self):
        self._change_state(StateType.USER_NOTIFIED)

    def change_state_finished(self):
        self._change_state(StateType.FINISHED)
