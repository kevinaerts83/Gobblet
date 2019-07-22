var GOBBLET = GOBBLET || {};

/**
 * Shape3D class
 * @class Shape3D
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.Shape3D = function() {
	this.points = [];
	//cached points are rotated and scaled
	this.cache = [];
	this.aHashMap = { 0:1, 1:2, 2:4, 3:8, 5:16, 6:32, 7:64, 8:128, 10:256, 11:512, 12:1024, 13:2048, 15:4096, 16:8192, 17:16384, 18:32768};
};

/**
 * Calculate the visible faces
 * @method dotProduct
 * @namespace GOBBLET
 * @param {array} faces of the shape
 */
/*GOBBLET.Shape3D.prototype.setVisibleFaces = function(faces, matrix) {
	var i, l, p = [];
	for(i = 0, l = this.cache[0].length; i < l; i+=1) {
		p[i] = matrix.projectPoint(this.cache[0][i]);
	}
	
	for(i = 0, l = faces.length; i < l; i+=1) {
		faces[i][3] = this.dotProduct(faces[i], p) ? 1 : 0;
	}
};*/

/**
 * Rotate all the points of the shape
 * @method rotate
 * @namespace GOBBLET
 * @param {array} rotationMatrix to rotate points
 */
GOBBLET.Shape3D.prototype.rotate = function(rotationMatrix) {
	var i, l, rotatedPoints = [];
	for (i = 0, l = this.points.length; i < l; i+=1) {
		rotatedPoints[i] = this.matrix.multiplyPointAndMatrix(this.points[i], rotationMatrix);
	}
	this.cache[0] = rotatedPoints;
};

/**
 * Make smaller cubes
 * @method zoom
 * @namespace GOBBLET
 * @param {array} scalingMatrix to zoom points
 */
GOBBLET.Shape3D.prototype.zoom = function(scalingMatrix, size) {
	var i, l, scaledPoints = [];
	for (i = 0, l = this.points.length; i < l; i+=1) {
		scaledPoints[i] = this.matrix.multiplyPointAndMatrix(this.cache[(size ? size - 1: 0)][i], scalingMatrix);
	}
	this.cache[size] = scaledPoints;
};
