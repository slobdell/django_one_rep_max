import django
import os
import requests
import traceback
import uuid

from barbell_video_processor import read_video

from celery import platforms
from celery.signals import worker_process_init
from celery.task import task

from one_rep_max.boto.boto_uploader import BotoUploader
from one_rep_max.orders.models import Order
from one_rep_max.mailgun.tasks import notify_admin
from one_rep_max.mailgun.tasks import send_order_completion_email


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
    # a bit hacky...file type is always avi because of the other thing
    amazon_key = "final/%s/%s.avi" % (user_id, (path_with_extension.split("/")[-1]).split(".")[0])
    final_url = BotoUploader.upload_single_file(source_file, amazon_key)
    amazon_url = "https://s3.amazonaws.com/%s" % final_url
    return amazon_url


@task
def create_video_process_from_order(order_id):
    try:
        django.setup()
        order = Order.get_by_id(order_id)
        order.change_state_processing()
        start_sec, end_sec = order.start__stop_seconds

        temp_path = _download_file(order.uploaded_video_url)

        output_file = _process_video(temp_path, order.orientation.index, start_sec, end_sec)

        amazon_url = _upload_file(output_file, temp_path, order.user_id)
        order.change_state_complete_processing()

        send_order_completion_email(order.get_user_email(), amazon_url)
        order.change_state_user_notified()
        order.update_final_video_url(amazon_url)
        order.charge()

        os.remove(temp_path)
        os.remove(output_file)
    except Exception as e:
        stack_trace = traceback.format_exc()
        order.change_state_failed()
        notify_admin(e, stack_trace)
        raise e


def cleanup_after_tasks(signum, frame):
    Order.kill_processing_orders()


def install_pool_process_sighandlers(**kwargs):
    platforms.signals["TERM"] = cleanup_after_tasks
    platforms.signals["INT"] = cleanup_after_tasks

worker_process_init.connect(install_pool_process_sighandlers)
