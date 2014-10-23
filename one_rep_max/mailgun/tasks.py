from celery.task import task
from .utils import send_test_email
from .utils import send_email_with_data


def send_confirmation_email(email_address, order_id):
    text = "Thanks for your order!\n\n"
    text += "Order ID: %s" % order_id
    send_email_with_data(email_address,
                         "OneRepMaxCalculator.com Order Confirmation",
                         text)


@task
def test_send_email():
    send_test_email()
