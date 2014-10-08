import json
import os
import cv2  # DELETEME this is just a test

from django.http import HttpResponse
from django.shortcuts import render_to_response


def render_to_json(data, status=200):
    return HttpResponse(json.dumps(data), content_type="application/json", status=status)


def home(request):
    render_data = {
        "dev": True if os.environ.get("I_AM_IN_DEV_ENV") else False
    }
    return render_to_response("basic_navigation/index.html", render_data)
