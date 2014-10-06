from celery.task import task
from .utils import send_test_email


@task
def test_send_email():
    send_test_email()
