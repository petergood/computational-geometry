from random import randint


def generate_lines(minp, maxp, n):
    minx, miny = minp
    maxx, maxy = maxp
    lines = []
    points = {}
    i = 0
    
    while i < n:
        start = (randint(minx, maxx), randint(miny, maxy))
        end = (randint(minx, maxx), randint(miny, maxy))
        if start[0] == end[0] or start in points or end in points:
            continue
        
        lines.append([start, end])
        points[start] = True
        points[end] = True
        i += 1
    
    return lines
