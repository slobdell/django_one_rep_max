import json

from django.http import Http404
from django.http import HttpResponse
from django.conf import settings

from one_rep_max.mailgun.tasks import send_confirmation_email
from one_rep_max.mailgun.utils import send_email_with_data
from one_rep_max.orders.models import Order
from one_rep_max.stripe.utils import charge_card
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
    post_data = request.POST

    user_id = int(request.session['user_id'])
    user = User.get_by_id(user_id)
    email_address = post_data['emailAddress']
    user.update_email(email_address)

    uploaded_video_id = int(post_data['videoId'])
    start_seconds = float(post_data['startSeconds'])
    end_seconds = float(post_data['endSeconds'])
    orientation_id = int(post_data['orientation'])

    order = Order.create(user_id,
                         uploaded_video_id,
                         start_seconds,
                         end_seconds,
                         orientation_id)
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


def user_info(request):
    if request.method == "POST":
        return _update_email(request)
    else:
        return _get_user_info(request)


def _update_email(request):
    post_data = request.POST
    user_id = int(request.session['user_id'])
    user = User.get_by_id(user_id)
    email_address = post_data['emailAddress']
    user.update_email(email_address)
    return HttpResponse(status=204)


def _get_user_info(request):
    facebook_service_id = request.GET.get('service_id')
    user = User.get_by_id(request.session['user_id'])
    if facebook_service_id != user.facebook_service_id:
        return HttpResponse()
    return render_to_json(user.to_json())


def add_credits(request):
    AMOUNT_TO_CHARGE = 5.00
    if request.method != "POST":
        raise Http404
    user_id = request.session['user_id']
    user = User.get_by_id(request.session['user_id'])
    stripe_token = request.POST['tokenId']
    stripe_email = request.POST['tokenEmail']
    success, error_message = charge_card(stripe_token, int(AMOUNT_TO_CHARGE * 100), user_id, stripe_email)
    if not success:
        return render_to_json({
            "error": error_message
        }, status=400)
    user.add_credits(AMOUNT_TO_CHARGE)
    return render_to_json(user.to_json())


def email(request):
    if request.method != "POST":
        raise Http404
    return_email = request.POST['returnEmail']
    message = return_email + "\n\n" + request.POST['message']
    for to_email in settings.ADMIN_EMAILS:
        send_email_with_data(to_email, "Customer Quandry", message)

    return HttpResponse(status=204)
