web: python manage.py collectstatic --noinput; gunicorn one_rep_max.wsgi --log-file -;
worker: celeryd -l info
