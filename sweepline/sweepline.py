import sortedcontainers
from enum import Enum


def get_intersection_point(start1, end1, start2, end2):
    if start1[0] == end1[0] or start2[0] == end2[0]:
        raise Exception('Segment cannot by parallel to OY axis.')

    A1 = (start1[1] - end1[1]) / (start1[0] - end1[0])
    A2 = (start2[1] - end2[1]) / (start2[0] - end2[0])
    b1 = start1[1] - A1 * start1[0]
    b2 = start2[1] - A2 * start2[0]

    if A1 == A2:
        return False

    Xa = (b2 - b1) / (A1 - A2)
    Ya = A2 * Xa + b2

    if ((Xa < max(min(start1[0], end1[0]), min(start2[0], end2[0]))) or
            (Xa > min(max(start1[0], end1[0]), max(start2[0], end2[0])))):
        return None
    else:
        return Point(Xa, Ya)


def verify_intersection(segment1, segment2):
    if segment1 is None or segment2 is None:
        return None
    return segment1.does_intersect_with(segment2)


class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y


class Segment:
    def __init__(self, start_point, end_point):
        self.start_point = start_point
        self.end_point = end_point

    def __lt__(self, other):
        return self.start_point.x < other.start_point.x

    def __eq__(self, other):
        return self.start_point.x == other.start_point.x

    def does_intersect_with(self, other):
        return get_intersection_point(
            (self.start_point.x, self.start_point.y),
            (self.end_point.x, self.end_point.y),
            (other.start_point.x, other.start_point.y),
            (other.end_point.x, other.end_point.y)
        )


class StatusSegmentWrapper:
    def __init__(self, segment):
        self.segment = segment

    def unwrap(self):
        return self.segment

    def __lt__(self, other):
        return self.segment.start_point.y < other.segment.start_point.y

    def __eq__(self, other):
        return self.segment.start_point.y == other.segment.start_point.y


class EventType(Enum):
    START = 1
    END = 2
    INTERSECT = 3


class Event:
    def __init__(self, event_type, point, involved_segments):
        self.event_type = event_type
        self.point = point
        self.involved_segments = involved_segments

    def __lt__(self, other):
        return self.point.x < other.point.x

    def __eq__(self, other):
        return self.point.x == other.point.x


class EventQueue:
    def __init__(self):
        self.queue = sortedcontainers.SortedList()

    def __len__(self):
        return len(self.queue)

    def bulk_add_segments(self, segments):
        for segment in segments:
            self.add_start_event(segment)
            self.add_end_event(segment)

    def add_start_event(self, segment):
        self.queue.add(Event(EventType.START, segment.start_point, [segment]))

    def add_end_event(self, segment):
        self.queue.add(Event(EventType.END, segment.end_point, [segment]))

    def add_intersect_event(self, intersection_point, segment1, segment2):
        self.queue.add(Event(EventType.INTERSECT, intersection_point, [segment1, segment2]))

    def is_in_queue(self, point):
        event = Event(None, point, None)  # ???
        return event in self.queue

    def get_next(self):
        return self.queue.pop(0)


class SweepLine:
    def __init__(self):
        self.status = sortedcontainers.SortedList()

    def add(self, segment):
        self.status.add(StatusSegmentWrapper(segment))

    def remove(self, segment):
        self.status.remove(StatusSegmentWrapper(segment))

    def upper_neighbour(self, segment):
        index = self.status.index(StatusSegmentWrapper(segment))
        if index == len(self.status) - 1:
            return None
        return self.status[index + 1].unwrap()

    def lower_neighbour(self, segment):
        index = self.status.index(StatusSegmentWrapper(segment))
        if index == 0:
            return None
        return self.status[index - 1].unwrap()


def sweep(segments):
    event_queue = EventQueue()
    sweep_line = SweepLine()
    event_queue.bulk_add_segments(segments)

    while len(event_queue) > 0:
        event = event_queue.get_next()
        involved_segments = event.involved_segments

        if event.event_type == EventType.START:
            segment = involved_segments[0]
            sweep_line.add(segment)
            upper_neighbour = sweep_line.upper_neighbour(segment)
            lower_neighbour = sweep_line.lower_neighbour(segment)
            intersection_with_upper_point = verify_intersection(segment, upper_neighbour)
            intersection_with_lower_point = verify_intersection(segment, lower_neighbour)

            if intersection_with_upper_point:
                event_queue.add_intersect_event(intersection_with_upper_point, segment, upper_neighbour)
            if intersection_with_lower_point:
                event_queue.add_intersect_event(intersection_with_lower_point, segment, lower_neighbour)
        elif event.event_type == EventType.END:
            segment = involved_segments[0]
            upper_neighbour = sweep_line.upper_neighbour(segment)
            lower_neighbour = sweep_line.lower_neighbour(segment)
            sweep_line.remove(segment)
            intersection_point = verify_intersection(upper_neighbour, lower_neighbour)

            if intersection_point is not None and not event_queue.is_in_queue(intersection_point):
                event_queue.add_intersect_event(intersection_point, lower_neighbour, upper_neighbour)


sweep([Segment(Point(-11, 20), Point(100, 100)), Segment(Point(-5, 10), Point(10, 40))])
