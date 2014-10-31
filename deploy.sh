#!/bin/bash

git push heroku master
heroku run python manage.py collectstatic --noinput
heroku run python -m one_rep_max.scripts.restart_failed_orders
