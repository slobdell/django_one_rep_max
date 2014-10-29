import django
import os
import requests
import uuid

from barbell_video_processor import read_video

from celery.task import task

from one_rep_max.boto.boto_uploader import BotoUploader
from one_rep_max.orders.models import Order
from one_rep_max.mailgun.tasks import send_order_completion_email


@task
def add(x, y):
    return x + y


def _download_file(amazon_url):
    print "DOWNLOADING %s" % amazon_url
    filename = amazon_url.split("/")[-1]
    temp_path = "./tmp/%s_download_%s" % (str(uuid.uuid4()), filename)
    if not os.path.exists(os.path.dirname(temp_path)):
        os.makedirs(os.path.dirname(temp_path))
    response = requests.get(amazon_url)
    with open(temp_path, "w+") as f:
        f.write(response.content)
    return temp_path


def _process_video(input_video_path, orientation_index, start_seconds, end_seconds):
    output_file = read_video.process(input_video_path, orientation_index, start_seconds, end_seconds)
    return output_file


def _upload_file(source_file, path_with_extension, user_id):
    amazon_key = "final/%s/%s" % (user_id, path_with_extension.split("/")[-1])
    final_url = BotoUploader.upload_single_file(source_file, amazon_key)
    amazon_url = "https://s3.amazonaws.com/%s" % final_url
    return amazon_url


@task
def create_video_process_from_order(order_id):
    django.setup()
    order = Order.get_by_id(order_id)
    start_sec, end_sec = order.start__stop_seconds

    temp_path = _download_file(order.uploaded_video_url)

    output_file = _process_video(temp_path, order.orientation.index, start_sec, end_sec)

    amazon_url = _upload_file(output_file, temp_path, order.user_id)
    send_order_completion_email(order.get_user_email(), amazon_url)
    # TODO now I need to charge the user

    os.remove(temp_path)
    os.remove(output_file)
