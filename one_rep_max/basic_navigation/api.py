import json

from django.http import Http404
from django.http import HttpResponse

from one_rep_max.uploaded_videos.models import UploadedVideo
from one_rep_max.users.models import User
from one_rep_max.utils.videos import create_video_metadata


def render_to_json(response_obj, context={}, content_type="application/json", status=200):
    json_str = json.dumps(response_obj, indent=4)
    return HttpResponse(json_str, content_type=content_type, status=status)


def upload_video(request):
    if request.method != "POST":
        raise Http404
    uploaded_file = request.FILES['file']
    meta = create_video_metadata(uploaded_file)

    user_id = request.session['user_id']
    uploaded_video = UploadedVideo.create_from_file(uploaded_file, user_id)

    render_data = {
        "id": uploaded_video.id
    }
    render_data.update(meta)
    return render_to_json(render_data)


def login(request):
    if request.method != "POST":
        raise Http404
    facebook_service_id = request.POST['facebook_service_id']
    user = User.get_or_create_from_fb_id(facebook_service_id)
    request.session['user_id'] = user.id
    request.session['facebook_service_id'] = facebook_service_id
    request.session.modified = True
    return HttpResponse(status=204)


def logout(request):
    del request.session['user_id']
    del request.session['facebook_service_id']
    return HttpResponse(status=204)
