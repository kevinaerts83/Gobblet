var GOBBLET = GOBBLET || {};

/**
 * Matrix helper class
 * @class Matrix
 * @constructor
 * @namespace GOBBLET
 * @param {decimal} canvasWidth
 * @param {decimal} canvasHeight
 */
GOBBLET.Matrix = function(canvasWidth, canvasHeight) {
	var centerX = canvasWidth/2, centerY = canvasHeight/2, centerZ = 0;//-centerX;
	/**
	 * translation matrix moves the point to the 0,0,0 position, to enable rotation calculations on this point
	 * @property translation
	 * @type array
	 */
	this.translation = [[1.0, 0, 0, -centerX],[0, 1.0, 0, -centerY],[0, 0, 1.0, -centerZ],[0, 0, 0, 1.0]];
	/**
	 * inverse translation matrix moves the point back to it's original position
	 * @property inverseTranslation
	 * @type array
	 */
	this.inverseTranslation = [[1.0, 0, 0, centerX],[0, 1.0, 0, centerY],[0, 0, 1.0, centerZ],[0, 0, 0, 1.0]];
	/**
	 * projection matrix, moves the point to it's z=0 position but adjusting the x and y so a 3d effect occurs
	 * @property projection
	 * @type array
	 */
	//this.projection =[[1.0, 0, 1/2 * Math.cos(Math.PI/4), 0], [0, 1.0, 1/2 * Math.sin(Math.PI/4), 0], [0, 0, 0, 0], [0, 0, 0, 1.0]];
};

/**
 * Multiply a point with a matrix
 * @method multiplyPointAndMatix
 * @namespace GOBBLET
 * @param {array} point A point represented by an array [x,y,z,1]
 * @param {array} matrix A 4x4 matrix
 */
GOBBLET.Matrix.prototype.multiplyPointAndMatrix = function(point, matrix) {
	var i, j, tmp, newPoint = [0,0,0,1];
	for(i=0; i < 4; i+=1) {
		tmp = 0;
		for(j=0; j < 4; j+=1) {
			tmp += point[j]*matrix[i][j];
		}
		newPoint[i] = tmp;
	}
	return newPoint;
};

GOBBLET.Matrix.prototype.projectPoint = function(point) {
	p = this.multiplyPointAndMatrix(point, this.translation);
	
	var x = p[0],
    y = p[1],
    z = p[2],
    f = -1/2000,
    s = 1;

    p = [x/((z*f) + s), y/((z*f) + s), 0, 1];
    
    return this.multiplyPointAndMatrix(p, this.inverseTranslation);
};

/**
 * Multiply a matrix with a matrix
 * @method multiplyMatrixAndMatrix
 * @namespace GOBBLET
 * @param {array} matrix1 a matrix 4x4
 * @param {array} matrix2 a matrix 4x4
 */
GOBBLET.Matrix.prototype.multiplyMatrixAndMatrix = function(matrix1, matrix2) {
	var i, j, newMatrix = [[],[],[],[]];
	for(i=0; i < 4; i+=1) {
		for(j=0; j < 4; j+=1) {
			newMatrix[i][j] = (matrix1[i][0] * matrix2[0][j]) + 
							  (matrix1[i][1] * matrix2[1][j]) + 
							  (matrix1[i][2] * matrix2[2][j]) + 
							  (matrix1[i][3] * matrix2[3][j]);
		}
	}
	return newMatrix;
};

/**
 * Translation
 * @method getTranslation
 * @namespace GOBBLET
 * @param {float} x
 * @param {float} y
 * @param {float} z
 */
GOBBLET.Matrix.prototype.getTranslation = function(x, y, z) {
	return  [[1.0, 0, 0, x],[0, 1.0, 0, y],[0, 0, 1.0, z],[0, 0, 0, 1.0]];
};

/**
 * Scaling
 * @method getScaling
 * @namespace GOBBLET
 * @param {float} zoom
 */
GOBBLET.Matrix.prototype.getScaling = function(scale) {
	return  [[scale, 0, 0, 0],[0, scale, 0, 0],[0, 0, scale, 0],[0, 0, 0, 1.0]];
};

/**
 * Rotation matrix
 * @method getRotationMatrix
 * @namespace GOBBLET
 * @param {float} rotation
 */
GOBBLET.Matrix.prototype.getRotationMatrix = function(x, y) {
	var angleX = Math.PI * x / 180,
		angleY = Math.PI * y / 180,
		cosx = Math.cos(angleX),
		sinx = -(Math.sin(angleX)),
		cosy = Math.cos(angleY),
		siny = -(Math.sin(angleY));
		
 		xFacesMatrix = [[1.0, 0, 0, 0], [0, cosx, -sinx, 0], [0, sinx, cosx, 0], [0, 0, 0, 1.0]];
		yFacesMatrix = [[cosy, 0, -siny, 0], [0, 1.0, 0, 0], [siny, 0, cosy, 0], [0, 0, 0, 1.0]];
	
	return this.multiplyMatrixAndMatrix(xFacesMatrix, yFacesMatrix);
};

/* 

USE FACTORY Patron
GOBBLET.Matrix.prototype.getRotationMatrix = function(x, y) {
	var angleX = Math.PI * x / 180,
		angleY = Math.PI * y / 180,
 		xFacesMatrix = GOBBLET.Rotation.factory('X', angleX, false).rotationMatrix,
		yFacesMatrix = GOBBLET.Rotation.factory('Y', angleY, false).rotationMatrix;
	    //var zFacesMatrix = this.matrix.makeNewMatrix(2, angleZ, clockwise);
	
	return this.multiplyMatrixAndMatrix(xFacesMatrix, yFacesMatrix);
	//this.matrix.multiplyMatrixAndMatrix(, zFacesMatrix);
};

//constructor
GOBBLET.Rotation = function() {
};
/*
 * A factory for creating matrix objects
 * @method factory
 * @namespace GOBBLET
 * @param {string} type: 'X', 'Y', 'Z'
 * @param {decimal} angle: Rotation angle
 * @param {bool} clockwise: Rotate clockwise or counter clockwise
 /
GOBBLET.Rotation.factory = function(type, angle, clockwise) {
	var constr = type,
		cosx = Math.cos(angle),
		sinx = (Math.sin(angle) * (clockwise ? 1 : -1));
	
	if(typeof GOBBLET.Rotation[constr] !== "function") {
		throw { 
			name: "Error",
			message: constr + " doesn't exist"
		};
	}
	
	if(typeof GOBBLET.Rotation[constr].prototype.multiplyPointAndMatrix !== "function"){
		GOBBLET.Rotation[constr].prototype = new GOBBLET.Matrix();
	}
	
	return new GOBBLET.Rotation[constr](cosx, sinx);
};
//rotation around the X-axis
GOBBLET.Rotation.X = function(cosx, sinx) {
	this.rotationMatrix = [[1.0, 0, 0, 0], [0, cosx, -sinx, 0], [0, sinx, cosx, 0], [0, 0, 0, 1.0]];
};
//rotation around the Y-axis
GOBBLET.Rotation.Y = function(cosx, sinx) {
	this.rotationMatrix = [[cosx, 0, -sinx, 0], [0, 1.0, 0, 0], [sinx, 0, cosx, 0], [0, 0, 0, 1.0]];
};
//rotation around the Z-axis
GOBBLET.Rotation.Z = function(cosx, sinx) {
	this.rotationMatrix = [[cosx, -sinx, 0, 0], [sinx, cosx, 0, 0], [0, 0, 1.0, 0], [0, 0, 0, 1.0]];
};


*/