const assert = require('chai').assert
const qt = require('../quadtree')

describe('RectangularRange', function() {
    it('should detect overlapping of two rectangles', function() {
        const range1 = new qt.RectangularRange(new qt.Point(-4, 2), new qt.Point(6, 12))
        const range2 = new qt.RectangularRange(new qt.Point(-8, -2), new qt.Point(-2, 4))
        assert.isTrue(range1.doesOverlapWith(range2))
    })

    it('should detect non-overlapping rectangles', function() {
        const range1 = new qt.RectangularRange(new qt.Point(-8, -2), new qt.Point(-2, 4))
        const range2 = new qt.RectangularRange(new qt.Point(0, 6), new qt.Point(8, 14))
        assert.isFalse(range1.doesOverlapWith(range2))
    })

    it('should detect point inside range', function() {
        const point = new qt.Point(3, 4)
        const range = new qt.RectangularRange(new qt.Point(-1, -1), new qt.Point(6, 7))
        assert.isTrue(range.isPointIn(point))
    })

    it('should detect point outside range', function() {
        const point = new qt.Point(20, 20)
        const range = new qt.RectangularRange(new qt.Point(-1, -1), new qt.Point(6, 7))
        assert.isFalse(range.isPointIn(point))
    })
})

describe('Node', function() {
    it('should populate node after second point is inserted', function() {
        const node = new qt.Node(new qt.Point(-100, -100), new qt.Point(100, 100))
        qt.insertPoint(node, new qt.Point(3, 4))
        assert.isNotNull(node.point)

        qt.insertPoint(node, new qt.Point(-2, -2))
        assert.isNull(node.point)
        assert.isNotNull(node.bottomLeftQuad)
        assert.isNotNull(node.topRightQuad)
    })

    it('should place points in correct quadrant', function() {
        const node = new qt.Node(new qt.Point(-100, -100), new qt.Point(100, 100))
        qt.insertPoint(node, new qt.Point(3, 4))
        qt.insertPoint(node, new qt.Point(-20, -20))
        qt.insertPoint(node, new qt.Point(60, 60))
        qt.insertPoint(node, new qt.Point(-20, 50))
        qt.insertPoint(node, new qt.Point(40, 10))

        const q2 = node.topLeftQuad
        const q11 = node.topRightQuad.topRightQuad
        const q133 = node.topRightQuad.bottomLeftQuad.bottomLeftQuad
        const q134 = node.topRightQuad.bottomLeftQuad.bottomRightQuad
        const q3 = node.bottomLeftQuad

        assert.equal(null, node.point)
        assert.equal(-20, q2.point.x)
        assert.equal(-20, q3.point.x)
        assert.equal(3, q133.point.x)
        assert.equal(40, q134.point.x)
        assert.equal(60, q11.point.x)
    })

    it('should get points contained in rectangular range', function() {
        const node = new qt.Node(new qt.Point(-100, -100), new qt.Point(100, 100))
        qt.insertPoint(node, new qt.Point(3, 4))
        qt.insertPoint(node, new qt.Point(-20, -20))
        qt.insertPoint(node, new qt.Point(60, 60))
        qt.insertPoint(node, new qt.Point(-20, 50))
        qt.insertPoint(node, new qt.Point(40, 10))
        qt.insertPoint(node, new qt.Point(50, 50))
        
        const points1 = qt.getPointsInRectangularRangeIter(node, new qt.RectangularRange(new qt.Point(-100, -100), new qt.Point(0, 0)))
        assert.deepInclude(points1, new qt.Point(-20, -20))

        const points2 = qt.getPointsInRectangularRangeIter(node, new qt.RectangularRange(new qt.Point(-100, 0), new qt.Point(100, 100)))
        assert.deepInclude(points2, new qt.Point(-20, 50))
        assert.deepInclude(points2, new qt.Point(3, 4))
        assert.deepInclude(points2, new qt.Point(40, 10))
        assert.deepInclude(points2, new qt.Point(60, 60))
        assert.deepInclude(points2, new qt.Point(50, 50))

        const points3 = qt.getPointsInRectangularRangeIter(node, new qt.RectangularRange(new qt.Point(49, 49), new qt.Point(51, 51)))
        assert.equal(1, points3.length)
        assert.deepInclude(points3, new qt.Point(50, 50))
    })
})