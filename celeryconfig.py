import os


if os.environ.get("I_AM_IN_DEV_ENV"):
    BROKER_URL = 'amqp://guest:guest@localhost//'
else:
    BROKER_URL = "amqp://nxwmvyul:5Zhb-we6IDlFPOJQAT5k2p5ePZm_IiSw@tiger.cloudamqp.com/nxwmvyul"

CELERY_IMPORTS = (
    'one_rep_max.tasks',
)


CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
'''

from celery import Celery

import os

# who the fuck decided to set this infrastructure up like this?  Of course I
# can't import the stupid module

# from django.conf import settings

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'one_rep_max.settings')

app = Celery('one_rep_max')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
# app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
print "FINISHED"
print "FINISHED"
print "FINISHED"
print "FINISHED"
print "FINISHED"
print "FINISHED"

@app.task(bind=True)
def debug_task(self):
    print "FUCK YOU!!!!"
'''
