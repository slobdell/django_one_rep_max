import cv2
import os
import uuid

from one_rep_max.boto.boto_uploader import BotoUploader


def save_in_memory_file_to_local_storage(in_mem_file):
    temp_path = "./tmp/%s.upload" % str(uuid.uuid4())
    if not os.path.exists(os.path.dirname(temp_path)):
        os.makedirs(os.path.dirname(temp_path))
    in_mem_file.seek(0)
    file_contents = in_mem_file.read()
    with open(temp_path, "w+") as f:
        f.write(file_contents)
    in_mem_file.seek(0)
    return temp_path


def _save_frame_to_amazon(frame):
    temp_path = "./tmp/%s.jpg" % str(uuid.uuid4())
    if not os.path.exists(os.path.dirname(temp_path)):
        os.makedirs(os.path.dirname(temp_path))
    cv2.imwrite(temp_path, frame)
    amazon_key = "thumbnails/%s.jpg" % str(uuid.uuid4())
    final_path = BotoUploader.upload_single_file(temp_path, amazon_key)
    amazon_url = "https://s3.amazonaws.com/%s" % final_path
    os.remove(temp_path)
    return amazon_url


def _get_video_length_from_capture(capture):
    frame_count = capture.get(cv2.cv.CV_CAP_PROP_FRAME_COUNT)
    frames_per_second = capture.get(cv2.cv.CV_CAP_PROP_FPS)
    return float(frame_count) / frames_per_second


def create_video_metadata(uploaded_file):
    temp_path = save_in_memory_file_to_local_storage(uploaded_file)

    capture = cv2.VideoCapture(temp_path)
    frame_count = capture.get(cv2.cv.CV_CAP_PROP_FRAME_COUNT)
    success, frame = capture.read(frame_count / 2)

    meta = {
        'video_seconds': _get_video_length_from_capture(capture),
        'thumbnail_url': _save_frame_to_amazon(frame),
    }
    os.remove(temp_path)
    return meta
