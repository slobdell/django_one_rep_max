import json
import os

from django.http import HttpResponse
from django.shortcuts import render_to_response

from one_rep_max.stripe.constants import get_publishable_key


def render_to_json(data, status=200):
    return HttpResponse(json.dumps(data), content_type="application/json", status=status)


def home(request):
    youtube_video_ids = (
        'rKBq8mTLRpE',
        'm-0tJu9aFE8',  # still need to replace this one
        'z3P3mCPxRtw',
        'dyisn-r6tuE',
    )
    render_data = {
        "youtube_video_ids": youtube_video_ids,
        "dev": True if os.environ.get("I_AM_IN_DEV_ENV") else False,
        "publishable_key": get_publishable_key()
    }
    return render_to_response("basic_navigation/index.html", render_data)


def sitemap(request):
    with open("one_rep_max/templates/sitemap.xml", "rb") as f:
        xml_content = f.read()
    return HttpResponse(xml_content, content_type="text/xml")
