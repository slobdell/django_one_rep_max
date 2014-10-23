import json

from django.http import Http404
from django.http import HttpResponse

from one_rep_max.mailgun.tasks import send_confirmation_email
from one_rep_max.orders.models import Order
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


def submit_order(request):
    if request.method != "POST":
        raise Http404

    user_id = int(request.session['user_id'])
    user = User.get_by_id(user_id)
    email_address = request.POST['emailAddress']
    user.update_email(email_address)

    uploaded_video_id = int(request.POST['uploadedVideoId'])
    start_seconds = float(request.POST['startSeconds'])
    end_seconds = float(request.POST['endSeconds'])

    order = Order.create(user_id,
                         uploaded_video_id,
                         start_seconds,
                         end_seconds)
    send_confirmation_email(email_address, order.id)
    return HttpResponse(status=204)


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
