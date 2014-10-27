import datetime
import mimetypes

from django.db import models

from one_rep_max.boto.boto_uploader import BotoUploader
from one_rep_max.boto.constants import BUCKET_NAME


SUPPORTED_FILE_TYPES = {
    'video/avi',
    'video/mp4',
    'video/mov',
    'video/quicktime',
}


class _UploadedVideo(models.Model):

    class Meta:
        app_label = 'uploaded_videos'
        db_table = 'uploaded_videos_uploaded_video'

    date_uploaded = models.DateTimeField(null=True)
    uploaded_to_amazon = models.BooleanField(default=False)
    amazon_bucket = models.CharField(max_length=255)
    user_id = models.IntegerField()
    extension = models.CharField(max_length=6)
    # SBL pretty sure I don't need any of the below logic
    seconds = models.IntegerField()  # SBL dunno if I will use this
    start_seconds = models.IntegerField(null=True)
    end_seconds = models.IntegerField(null=True)


class UploadedVideo(object):

    BASE_URL = "https://s3.amazonaws.com"

    def __init__(self, _uploaded_video):
        self._uploaded_video = _uploaded_video

    @classmethod
    def _wrap(cls, _uploaded_video):
        return UploadedVideo(_uploaded_video)

    @classmethod
    def create_from_file(cls,
                         file_obj,
                         user_id,
                         start_seconds=None,
                         end_seconds=None):
        file_type = file_obj.content_type
        if file_type not in SUPPORTED_FILE_TYPES:
            raise ValueError("%s is not a supported mime type" % file_type)
        extension = mimetypes.guess_extension(file_type)
        # FIXME need to compute seconds at some point now before the site goes
        # non-free
        _uploaded_file = _UploadedVideo.objects.create(amazon_bucket=BUCKET_NAME,
                                                       user_id=user_id,
                                                       extension=extension,
                                                       seconds=0,
                                                       start_seconds=start_seconds,
                                                       end_seconds=end_seconds)
        uploaded_file = cls._wrap(_uploaded_file)
        BotoUploader.upload_single_file_from_memory(file_obj, uploaded_file.amazon_key)
        uploaded_file.mark_uploaded()
        return uploaded_file

    def mark_uploaded(self):
        self._uploaded_video.date_uploaded = datetime.datetime.utcnow()
        self._uploaded_video.uploaded_to_amazon = True
        self._uploaded_video.save()

    @classmethod
    def get_by_id(cls, picture_id):
        _uploaded_video = _UploadedVideo.objects.get(id=picture_id)
        return UploadedVideo._wrap(_uploaded_video)

    @classmethod
    def get_by_ids(cls, picture_ids):
        _uploaded_videos = _UploadedVideo.objects.filter(id__in=picture_ids)
        return [UploadedVideo._wrap(_uploaded_video) for _uploaded_video in _uploaded_videos]

    @classmethod
    def get_most_recent_datetime(cls):
        return _UploadedVideo.objects.all().latest('date_taken').date_taken

    @property
    def amazon_key(self):
        return "uploads/%s/%s%s" % (self.user_id,
                                    self.id,
                                    self.extension)

    @property
    def amazon_url(self):
        return "%s/%s/%s" % (self.BASE_URL, BUCKET_NAME, self.amazon_key)

    @property
    def id(self):
        return self._uploaded_video.id

    @property
    def user_id(self):
        return self._uploaded_video.user_id

    @property
    def extension(self):
        return self._uploaded_video.extension

    @property
    def date_taken(self):
        return self._uploaded_video.date_taken

    @property
    def seconds(self):
        return self._uploaded_video.seconds
