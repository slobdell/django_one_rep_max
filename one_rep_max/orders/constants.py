from richenum import OrderedRichEnum
from richenum import OrderedRichEnumValue


class _StateType(OrderedRichEnumValue):
    def __init__(self, index, canonical_name, display_name):
        super(_StateType, self).__init__(index, canonical_name, display_name)


class StateType(OrderedRichEnum):
    QUEUED = _StateType(1, 'queued', 'Queued')
    PROCESSING = _StateType(2, 'processing', 'Processing')
    COMPLETE_PROCESSING = _StateType(3, 'complete_processing', 'Completed')
    FAILED = _StateType(4, 'failed', 'Failed')
    USER_NOTIFIED = _StateType(5, 'user_notified', 'Completed')
    FINISHED = _StateType(6, 'finished', 'Completed')


class _OrientationType(OrderedRichEnumValue):
    pass


class OrientationType(OrderedRichEnum):
    NONE = _OrientationType(1, 'none', 'None')
    CLOCKWISE_90 = _OrientationType(2, 'clockwise_90', 'Clockwise 90 Degrees')
    CLOCKWISE_180 = _OrientationType(3, 'clockwise_180', 'Clockwise 180 Degrees')
    CLOCKWISE_270 = _OrientationType(4, 'clockwise_270', 'Clockwise 270 Degrees')
