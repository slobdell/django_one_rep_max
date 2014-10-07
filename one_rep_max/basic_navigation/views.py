import json
import cv2  # DELETEME this is just a test

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core.cache import cache


def render_to_json(data, status=200):
    return HttpResponse(json.dumps(data), content_type="application/json", status=status)


def home(request):
    cache.set("KEY", 20, 60)
    deleteme = cache.get("KEY")
    render_data = {
    }
    return render_to_response("basic_navigation/index.html", render_data)
