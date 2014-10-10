import json

from django.http import Http404
from django.http import HttpResponse


def render_to_json(response_obj, context={}, content_type="application/json", status=200):
    json_str = json.dumps(response_obj, indent=4)
    return HttpResponse(json_str, content_type=content_type, status=status)


def upload_video(request):
    if request.method != "POST":
        raise Http404
    uploaded_file = request.FILES['file']
    # DO STUFF WITH THE FILE
    uploaded_file = uploaded_file
    return render_to_json({
        "id": 999
    })
