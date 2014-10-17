
import datetime
import mimetypes

from django.db import models

from one_rep_max.boto.boto_uploader import BotoUploader
from one_rep_max.boto.constants import BUCKET_NAME


class _FinalizedVideo(models.Model):

    date_created = models.DateTimeField()
    amazon_bucket = models.CharField(max_length=255)
    user_id = models.IntegerField()
    extension = models.CharField(max_length=6)


class FinalizedVideo(object):
    '''
    Pretty sure I'll need to do some sort of create from file path thing
    '''

    BASE_URL = "https://s3.amazonaws.com"

    def __init__(self, _finalized_video):
        self._finalized_video = _finalized_video

    @classmethod
    def _wrap(cls, _finalized_video):
        return FinalizedVideo(_finalized_video)

    @property
    def amazon_key(self):
        return "%s/%s%s" % (self.user_id,
                            self.id,
                            self.extension)
