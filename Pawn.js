var GOBBLET = GOBBLET || {};

/**
 * Pawn class
 * @class Pawn
 * @constructor
 * @namespace GOBBLET
 * @param {matrix} matrix Our matrix object with defined center
 * @param {float} x x-axis value
 * @param {float} y y-axis value
 * @param {float} z z-axis value
 * @param {float} d depth of the pawn
 * @param {int} size 0 = biggest pawn, 1 = normal pawn, ...
 */
GOBBLET.Pawn = function(matrix, x, y, z, h, d, size, isTurn, n) {
	this.matrix = matrix;
	this.depth = d;
	this.pHeight = Math.floor(h * Math.pow(0.7, size));
	this.size = size;
	this.visible = (size % 4 === 0);
	this.setInvisible = false;
	this.onTheBoard = false;
	this.endX = x;
	this.endZ = z;
	this.enable = true;
	this.isTurn = isTurn;
	this.tile = -1;
	
	y -= this.pHeight;
	this.centerPoint = [x, y, z, 1];
	this.centerPoint2D = [x, y, z, 1];

	this.mouseX = 0;
	this.mouseY = 0;
	this.z_index = z + d / 2;
	this.id = n;
};

/**
 * inherit from Shape class
 * @method prototype
 */
GOBBLET.Pawn.prototype = new GOBBLET.Shape();

/**
 * scale and rotate the center point of the shape
 * @method zoomAndRotate
 * @namespace GOBBLET
 */
GOBBLET.Pawn.prototype.zoomAndRotate = function(scale, rotMatrix) {
	if(this.visible) {
		var p = [this.centerPoint[0], this.centerPoint[1], this.centerPoint[2], 1];
		if(rotMatrix) {
			p = this.matrix.multiplyPointAndMatrix(p, this.matrix.translation);
			p = this.matrix.multiplyPointAndMatrix(p, this.matrix.getScaling(scale /100.0));
		    p = this.matrix.multiplyPointAndMatrix(p, rotMatrix);
			p = this.matrix.multiplyPointAndMatrix(p, this.matrix.inverseTranslation);
		}
		this.z_index = p[2] + (this.depth / 2);
		this.centerPoint2D = p;
	}
};

/**
* Move selected pawn according to the mouse movement
* @method translate
*/
GOBBLET.Pawn.prototype.move = function(newX, newY, angle) {
	 var sine = Math.round(Math.sin(Math.PI * angle/180)),
	 cosine = Math.round(Math.cos(Math.PI * angle/180)),
	 tx = (newX - this.mouseX),
	 ty = (newY - this.mouseY),
	 x = tx*cosine - ty*sine,
	 y = tx*sine + ty*cosine;
	
	this.centerPoint[0] += x;
	this.centerPoint[2] += y;
	
	this.mouseX = newX;
	this.mouseY = newY;
};

/**
* Lift the pawn on mouse up, drop on mouse down
* @method lift
*/
GOBBLET.Pawn.prototype.lift = function(up) {
	this.centerPoint[1] += up;
};
/**
* Place the pawn onto the board
* @method endMove
*/
GOBBLET.Pawn.prototype.endMove = function(h) {
	this.centerPoint[1] = h - this.pHeight;
};

/**
* Validate after another pawn has moved
* onDown mouse => isDown = false; isDownValid = true; isOnBoard = true;
* onUp mouse (Invalid move) => isDown = true; isDownValid = false; isOnBoard = check if selected pawn came from stack or board;
* movePawn (valid move) => isDown = true; isDownValid = true; isOnBoard = true;
* @method notification
*/
GOBBLET.Pawn.prototype.notification = function(args) {
	var i,
		isDown = args[0],
		isDownValid = args[1],
		bState = args[2],
		isOnBoard = args[3],
		found = false;
	if(this.tile > -1) {
		var t = this.shape3D.aHashMap[this.tile];
		for(i=0; i < this.size; i++) {
			if((bState[i] & t) === t) {
				found = true;
				this.setInvisible = true;
				break;
			}
		}
		if(!found) {
			this.visible = true;
		}
	}
	if(isDown) {
		if(isDownValid) {
			this.isTurn ^= 1;
		}
		if(isOnBoard) {
			this.enable = isDownValid;
		}
	}
};
/**
* Finish event settings
* @method endEvent
*/
GOBBLET.Pawn.prototype.endEvent = function(args) {
	if(this.setInvisible) {
		this.visible = false;
		this.setInvisible = false;
	}
};