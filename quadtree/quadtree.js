class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

const isPointInRectangularRange = (point, bottomLeftPoint, topRightPoint) => {
    return point.x >= bottomLeftPoint.x && point.x < topRightPoint.x 
        && point.y >= bottomLeftPoint.y && point.y < topRightPoint.y
}

class Node {
    constructor(bottomLeftPoint, topRightPoint) {
        this.point = null
        this.bottomLeftPoint = bottomLeftPoint
        this.topRightPoint = topRightPoint
        
        this.hasBeenPopulated = false
        this.topLeftQuad = null
        this.topRightQuad = null
        this.bottomLeftQuad = null
        this.bottomRightQuad = null
    }

    populateQuads() {
        const tr = this.topRightPoint
        const bl = this.bottomLeftPoint
        const a = (tr.x - bl.x) / 2
        this.hasBeenPopulated = true

        this.topLeftQuad = new Node(new Point(bl.x, bl.y + a), new Point(bl.x + a, tr.y))
        this.topRightQuad = new Node(new Point(bl.x + a, bl.y + a), tr)
        this.bottomLeftQuad = new Node(bl, new Point(bl.x + a, bl.y + a))
        this.bottomRightQuad = new Node(new Point(bl.x + a, bl.y), new Point(tr.x, bl.y + a))
    }

    isPointInRange(point) {
        return isPointInRectangularRange(point, this.bottomLeftPoint, this.topRightPoint)
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

const bottomLeftPoint = new Point(-100, -100)
const topRightPoint = new Point(100, 100)
const rootNode = new Node(bottomLeftPoint, topRightPoint)

const insertPoint = (node, point) => {
    if (!isPointInRectangularRange(point, node.bottomLeftPoint, node.topRightPoint)) {
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