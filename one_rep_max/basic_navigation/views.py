import json
import cv2  # DELETEME this is just a test

from django.http import HttpResponse
from django.shortcuts import render_to_response

from one_rep_max.mailgun.tasks import test_send_email


def render_to_json(data, status=200):
    return HttpResponse(json.dumps(data), content_type="application/json", status=status)


def home(request):
    test_send_email.delay()  # delete this as well
    render_data = {
    }
    return render_to_response("basic_navigation/index.html", render_data)
