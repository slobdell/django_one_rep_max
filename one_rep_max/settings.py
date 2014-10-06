"""
Django settings for one_rep_max project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROJECT_PATH = os.path.realpath(os.path.dirname(__file__))

TEMPLATE_DIRS = (
    PROJECT_PATH + '/templates/',
)
STATICFILES_DIRS = (
    os.path.join(PROJECT_PATH, 'static'),
)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'v=hn5+4i10$m@#^#kvljd#^wh86ovx5e6!tucuvlz4-5!o0$_g'

DEBUG = False
TEMPLATE_DEBUG = False
if os.environ.get("I_AM_IN_DEV_ENV"):
    DEBUG = True
    TEMPLATE_DEBUG = True

ALLOWED_HOSTS = [
    ".herokuapp.com",
    ".onerepmaxcalculator.com"
]

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 'one_rep_max.pictures',
    # 'one_rep_max.pricing',
    # 'one_rep_max.orders',
    # 'one_rep_max.events'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'one_rep_max.urls'

WSGI_APPLICATION = 'one_rep_max.wsgi.application'

if os.getenv("I_AM_IN_DEV_ENV"):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'd7rn3c9b5n7j4j',
            'USER': 'myqawhzmkxqqfo',
            'PASSWORD': 'denF5Mawx9xpUPIDqT6jRB3Woo',
            'HOST': 'ec2-23-21-94-137.compute-1.amazonaws.com',
            'PORT': '5432',
        }
    }

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_ROOT = 'staticfiles'

# TODO make these secret
AWS_ACCESS_KEY_ID = "AKIAJQGJ462PV262GGVQ"
AWS_SECRET_ACCESS_KEY = "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"
AWS_STORAGE_BUCKET_NAME = "one-rep-max-static"

if os.environ.get("I_AM_IN_DEV_ENV"):
    STATIC_URL = '/static/'
else:
    # this won't work for collectstatic locally
    STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    STATIC_URL = 'http://' + AWS_STORAGE_BUCKET_NAME + '.s3.amazonaws.com/'

if os.environ.get("I_AM_IN_DEV_ENV"):
    BROKER_URL = 'amqp://guest:guest@localhost//'
else:
    BROKER_URL = "amqp://nxwmvyul:5Zhb-we6IDlFPOJQAT5k2p5ePZm_IiSw@tiger.cloudamqp.com/nxwmvyul"


CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
