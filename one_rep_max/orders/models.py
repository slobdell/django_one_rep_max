import datetime

from django.db import models

from one_rep_max.orders.constants import OrientationType
from one_rep_max.orders.constants import StateType
from one_rep_max.orders.utils import get_dollar_cost_from_video_seconds
from one_rep_max.uploaded_videos.models import UploadedVideo
from one_rep_max.users.models import User


class _Order(models.Model):

    class Meta:
        app_label = "orders"
        db_table = "orders_order"

    user_id = models.IntegerField()
    create_date = models.DateTimeField()
    state_id = models.IntegerField(default=StateType.QUEUED.index)
    orientation_id = models.IntegerField(default=OrientationType.NONE.index)
    dollar_cost = models.FloatField(null=True)
    uploaded_video_id = models.IntegerField()
    start_seconds = models.FloatField()
    end_seconds = models.FloatField()
    final_video_url = models.CharField(max_length=255, default='')


class Order(object):

    def __init__(self, _order):
        self._order = _order

    @classmethod
    def _wrap(cls, _order):
        return Order(_order)

    @classmethod
    def create(cls,
               user_id,
               uploaded_video_id,
               start_seconds,
               end_seconds,
               orientation_id):
        delta_seconds = end_seconds - start_seconds
        _order = _Order.objects.create(user_id=user_id,
                                       uploaded_video_id=uploaded_video_id,
                                       create_date=datetime.datetime.utcnow(),
                                       state_id=StateType.QUEUED.index,
                                       orientation_id=orientation_id,
                                       start_seconds=start_seconds,
                                       end_seconds=end_seconds,
                                       dollar_cost=get_dollar_cost_from_video_seconds(delta_seconds))
        return cls._wrap(_order)

    @classmethod
    def get_failed_orders(cls):
        _orders = _Order.objects.filter(state_id=StateType.FAILED.index)
        _orders = list(_orders)
        return [cls._wrap(_order) for _order in _orders]

    @classmethod
    def kill_processing_orders(cls):
        _orders = _Order.objects.filter(state_id=StateType.PROCESSING.index)
        for _order in _orders:
            _order.state_id = StateType.FAILED.index
            _order.save()

    @classmethod
    def get_by_id(cls, order_id):
        _order = _Order.objects.get(id=order_id)
        return cls._wrap(_order)

    @property
    def uploaded_video_url(self):
        uploaded_video = UploadedVideo.get_by_id(self._order.uploaded_video_id)
        return uploaded_video.amazon_url

    def get_video_url(self):
        # fetch the uploaded video and returns its url
        pass

    def get_user_email(self):
        user = User.get_by_id(self._order.user_id)
        return user.email

    @property
    def state(self):
        return StateType.from_index(self._order.state_id)

    @property
    def orientation(self):
        return OrientationType.from_index(self._order.orientation_id)

    @property
    def id(self):
        return self._order.id

    def _change_state(self, state_type):
        print "Changing order %s to state %s" % (self.id, state_type.display_name)
        self._order.state_id = state_type.index
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

    @property
    def start__stop_seconds(self):
        o = self._order
        return o.start_seconds, o.end_seconds

    @property
    def user_id(self):
        return self._order.user_id

    def update_final_video_url(self, final_url):
        # TODO refactor all this copy and paste
        self._order.final_video_url = final_url
        self._order.save()

    def charge(self):
        user = User.get_by_id(self._order.user_id)
        user.charge_account(self._order.dollar_cost)
