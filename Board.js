var GOBBLET = GOBBLET || {};
/**
 * Board class
 * @class Board
 * @namespace GOBBLET
 * @param {array} matrix Our matrix object with defined center
 */
GOBBLET.Board = function(matrix, x, y, z) {
	this.matrix = matrix;
	this.centerPoint = [x, y, z, 1];
	this.centerPoint2D = [x, y, z, 1];
};

/**
 * inherit from Shape class
 * @method prototype
 */
GOBBLET.Board.prototype = new GOBBLET.Shape();