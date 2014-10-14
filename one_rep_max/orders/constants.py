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
