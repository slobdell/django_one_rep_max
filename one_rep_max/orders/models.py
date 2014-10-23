import datetime

from django.db import models

from one_rep_max.orders.constants import StateType
from one_rep_max.orders.utils import get_dollar_cost_from_video_seconds


class _Order(models.Model):

    class Meta:
        app_label = "orders"
        db_table = "orders_order"

    user_id = models.IntegerField()
    create_date = models.DateTimeField()
    state_id = models.IntegerField(default=StateType.QUEUED.index)
    dollar_cost = models.FloatField(null=True)
    uploaded_video_id = models.IntegerField()
    start_seconds = models.FloatField()
    end_seconds = models.FloatField()


class Order(object):

    def __init__(self, _order):
        self._order = _order

    def _wrap(self, _order):
        return Order(_order)

    @classmethod
    def create(cls,
               user_id,
               uploaded_video_id,
               start_seconds,
               end_seconds):
        delta_seconds = end_seconds - start_seconds
        _order = _Order.objects.create(user_id=user_id,
                                       uploaded_file_id=uploaded_video_id,
                                       create_date=datetime.datetime.utcnow(),
                                       state_id=StateType.QUEUED.index,
                                       start_seconds=start_seconds,
                                       end_seconds=end_seconds,
                                       dollar_cost=get_dollar_cost_from_video_seconds(delta_seconds))
        return cls._wrap(_order)

    def get_video_url(self):
        # fetch the uploaded video and returns its url
        pass

    def get_user_email(self):
        # fetch the user then return his/her email
        pass

    @property
    def state(self):
        return StateType.from_index(self._order.state_id)

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
