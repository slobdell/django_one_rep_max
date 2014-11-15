import json
import os

from django.http import HttpResponse
from django.shortcuts import render_to_response

from one_rep_max.stripe.constants import get_publishable_key


GOOGLE_UGLY_URL = '_escaped_fragment_'


def render_to_json(data, status=200):
    return HttpResponse(json.dumps(data), content_type="application/json", status=status)


def static_pages_for_crawlers(request):
    requested_page = request.GET[GOOGLE_UGLY_URL]
    requested_page_to_static_file = {
        'account': 'account.html',
        'about': 'about.html',
        'contact': 'contact.html'
    }
    '''
        "!orientation": "orientationView",
        "!youtube/:videoId": "youtube",
        "!account": "accountView",
        "!thankyou": "thankYouView",
        "!summary": "orderSummaryView",
        "!upload": "uploadView",
    '''
    static_file = requested_page_to_static_file[requested_page]
    return render_to_response("static_pages/%s" % static_file, {})


def home(request):
    if GOOGLE_UGLY_URL in request.GET:
        try:
            return static_pages_for_crawlers(request)
        except KeyError:
            pass  # non-existent page

    youtube_video_ids = (
        ('7EUZblF_ObA', 724),
        ('eLYxnhlPFtc', 297),
        ('z3P3mCPxRtw', 445),
        ('dyisn-r6tuE', 661),
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
