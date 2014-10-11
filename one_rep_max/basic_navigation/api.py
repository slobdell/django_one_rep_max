import json

from django.http import Http404
from django.http import HttpResponse

from one_rep_max.uploaded_videos.models import UploadedVideo


def render_to_json(response_obj, context={}, content_type="application/json", status=200):
    json_str = json.dumps(response_obj, indent=4)
    return HttpResponse(json_str, content_type=content_type, status=status)


def upload_video(request):
    if request.method != "POST":
        raise Http404
    uploaded_file = request.FILES['file']

    user_id = 9999  # TODO make a user id
    # TODO need the original filename
    uploaded_video = UploadedVideo.create_from_file(uploaded_file, user_id)

    return render_to_json({
        "id": uploaded_video.id
    })
