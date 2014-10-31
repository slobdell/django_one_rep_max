import django

from one_rep_max.orders.models import Order
from one_rep_max.tasks import create_video_process_from_order


def restart_failed_orders():
    django.setup()
    orders = Order.get_failed_orders()
    print "Restarting %s orders" % len(orders)
    for order in orders:
        create_video_process_from_order.delay(order.id)

if __name__ == "__main__":
    print "Restarting Failed Orders"
    restart_failed_orders()
