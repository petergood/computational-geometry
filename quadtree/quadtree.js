class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class RectangularRange {
    constructor(bottomLeftPoint, topRightPoint) {
        this.bottomLeftPoint = bottomLeftPoint
        this.topRightPoint = topRightPoint
    }

    doesOverlapWith(other) {
        return this.bottomLeftPoint.x < other.topRightPoint.x && this.topRightPoint.x > other.bottomLeftPoint.x
            && this.bottomLeftPoint.y < other.topRightPoint.y && this.topRightPoint.y > other.bottomLeftPoint.y
    }

    isPointIn(point) {
        return point.x >= this.bottomLeftPoint.x && point.x < this.topRightPoint.x 
            && point.y >= this.bottomLeftPoint.y && point.y < this.topRightPoint.y
    }
}

class Node {
    constructor(bottomLeftPoint, topRightPoint) {
        this.point = null
        this.range = new RectangularRange(bottomLeftPoint, topRightPoint)
        
        this.hasBeenPopulated = false
        this.topLeftQuad = null
        this.topRightQuad = null
        this.bottomLeftQuad = null
        this.bottomRightQuad = null
    }

    populateQuads() {
        const tr = this.range.topRightPoint
        const bl = this.range.bottomLeftPoint
        const a = (tr.x - bl.x) / 2
        this.hasBeenPopulated = true

        this.topLeftQuad = new Node(new Point(bl.x, bl.y + a), new Point(bl.x + a, tr.y))
        this.topRightQuad = new Node(new Point(bl.x + a, bl.y + a), tr)
        this.bottomLeftQuad = new Node(bl, new Point(bl.x + a, bl.y + a))
        this.bottomRightQuad = new Node(new Point(bl.x + a, bl.y), new Point(tr.x, bl.y + a))
    }

    isPointInRange(point) {
        return this.range.isPointIn(point, this.bottomLeftPoint, this.topRightPoint)
    }

    insertIntoQuad(point) {
        if (!this.hasBeenPopulated) {
            throw "Node is not populated."
        }

        if (this.topLeftQuad.isPointInRange(point)) {
            insertPoint(this.topLeftQuad, point)
        } else if (this.topRightQuad.isPointInRange(point)) {
            insertPoint(this.topRightQuad, point)
        } else if (this.bottomLeftQuad.isPointInRange(point)) {
            insertPoint(this.bottomLeftQuad, point)
        } else if (this.bottomRightQuad.isPointInRange(point)) {
            insertPoint(this.bottomRightQuad, point)
        }
    }
}

const insertPoint = (node, point) => {
    if (!node.isPointInRange(point)) {
        return
    }

    if (node.point == null && !node.hasBeenPopulated) {
        node.point = point
        return
    }

    if (!node.hasBeenPopulated) {
        node.populateQuads()
        node.insertIntoQuad(node.point)
        node.insertIntoQuad(point)
        node.point = null
        return
    }

    insertPoint(node.topLeftQuad, point)
    insertPoint(node.topRightQuad, point)
    insertPoint(node.bottomLeftQuad, point)
    insertPoint(node.bottomRightQuad, point)
}

const getPointsInRectangularRange = (node, range) => {
    if (!node.hasBeenPopulated && node.point == null) {
        return []
    }

    if (!range.doesOverlapWith(node.range)) {
        return []
    }

    if (!node.hasBeenPopulated && range.isPointIn(node.point)) {
        return [ node.point ]
    }

    if (!node.hasBeenPopulated) {
        return []
    }

    res = []
    res = res.concat(getPointsInRectangularRange(node.topLeftQuad, range))
    res = res.concat(getPointsInRectangularRange(node.topRightQuad, range))
    res = res.concat(getPointsInRectangularRange(node.bottomLeftQuad, range))
    res = res.concat(getPointsInRectangularRange(node.bottomRightQuad, range))
    return res
}

module.exports = {
    Point,
    RectangularRange,
    Node,
    insertPoint,
    getPointsInRectangularRange
}