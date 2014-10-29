from celery.task import task
from .utils import send_test_email
from .utils import send_email_with_data
from .constants import ADMIN_EMAIL


def send_confirmation_email(email_address, order_id):
    text = "Thanks for your order!\n\n"
    text += "Order ID: %s" % order_id
    send_email_with_data(email_address,
                         "OneRepMaxCalculator.com Order Confirmation",
                         text)


def send_order_completion_email(email_address, final_url):
    text = "Hey your order finished!\n\n"
    text += "Final video URL: %s" % final_url
    send_email_with_data(email_address,
                         "OneRepMaxCalculator.com Digital Delivery",
                         text)


def notify_admin(exception):
    text = "Exception: %s" % exception
    if hasattr(exception, "message"):
        text += "\n%s" % exception.message
    send_email_with_data(ADMIN_EMAIL, "OneRepMax Error!", text)


@task
def test_send_email():
    send_test_email()
