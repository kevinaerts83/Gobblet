var GOBBLET = GOBBLET || {};
/**
 * Cube class
 * @class Cube
 * @namespace GOBBLET
 * @param {int} s tileSize size of one board tile
 * @param {array} matrix Our matrix object with defined center
 */
GOBBLET.Board3D = function(s, matrix) {
	this.matrix = matrix;
	this.tileSize = s;
	this.tileCenters = [];
	/*this.w = s*4;
	this.h = 10;*/
	
	/**
	 * define points of the board
	 * @property points
	 * @type array
	*/
	this.points[0] = [-2*s,0,-2*s,1];
	this.points[1] = [-s,0,-2*s,1];
	this.points[2] = [0,0,-2*s,1];
	this.points[3] = [s,0,-2*s,1];
	this.points[4] = [2*s,0,-2*s,1];
	
	this.points[5] = [-2*s,0,-s,1];
	this.points[6] = [-s,0,-s,1];
	this.points[7] = [0,0,-s,1];
	this.points[8] = [s,0,-s,1];
	this.points[9] = [2*s,0,-s,1];
	
	this.points[10] = [-2*s,0,0,1];
	this.points[11] = [-s,0,0,1];
	this.points[12] = [0,0,0,1];
	this.points[13] = [s,0,0,1];
	this.points[14] = [2*s,0,0,1];
	
	this.points[15] = [-2*s,0,s,1];
	this.points[16] = [-s,0,s,1];
	this.points[17] = [0,0,s,1];
	this.points[18] = [s,0,s,1];
	this.points[19] = [2*s,0,s,1];
	
	this.points[20] = [-2*s,0,2*s,1];
	this.points[21] = [-s,0,2*s,1];
	this.points[22] = [0,0,2*s,1];
	this.points[23] = [s,0,2*s,1];
	this.points[24] = [2*s,0,2*s,1];
	
	this.points[25] = [-2*s,10,-2*s,1];
	this.points[26] = [2*s,10,-2*s,1];
	this.points[27] = [-2*s,10,2*s,1];
	this.points[28] = [2*s,10,2*s,1];
	
	/**
	 * define 12 faces of the cube
	 * @property faces
	 * @type array
	 */
	this.faces = [];
	
	//back
	this.faces[0] = [4, 26, 25, 0];
	this.faces[1] = [25, 0, 4, 0];
	//right
	this.faces[2] = [28, 26, 4, 0];
	this.faces[3] = [4, 24, 28, 0];
	//left
	this.faces[4] = [0, 25, 27, 0];
	this.faces[5] = [27, 20, 0, 0];
	//front
	this.faces[6] = [24, 20, 27, 0];
	this.faces[7] = [27, 28, 24, 0];
	//down
	/*this.faces[36] = [28, 24, 23];
	this.faces[37] = [23, 27, 28];*/
	
	//up
	this.faces[8] = [20, 24, 4, 1];
	this.faces[9] = [4, 0, 20, 1];
	
	this.faces[10] = [5 ,6, 1, 1];
	this.faces[11] = [1, 0, 5, 1];
	this.faces[12] = [7, 8, 3, 1];
	this.faces[13] = [3, 2, 7, 1];
	
	this.faces[14] = [11, 12, 7, 1];
	this.faces[15] = [7, 6, 11, 1];
	this.faces[16] = [13, 14, 9, 1];
	this.faces[17] = [9, 8, 13, 1];
	
	this.faces[18] = [15, 16, 11, 1];
	this.faces[19] = [11, 10, 15, 1];
	this.faces[20] = [17, 18, 13, 1];
	this.faces[21] = [13, 12, 17, 1];
	
	this.faces[22] = [21, 22, 17, 1];
	this.faces[23] = [17, 16, 21, 1];
	this.faces[24] = [23, 24, 19, 1];
	this.faces[25] = [19, 18, 23, 1];

	/**
	 * store tileCenters to position pawns
	 * @property tileCenters
	 * @type array
	 */
	this.tileCenters[0] = [-1.5*s,0,-1.5*s,1];
	this.tileCenters[1] = [-0.5*s,0,-1.5*s,1];
	this.tileCenters[2] = [0.5*s,0,-1.5*s,1];
	this.tileCenters[3] = [1.5*s,0,-1.5*s,1];
	
	this.tileCenters[5] = [-1.5*s,0,-0.5*s,1];
	this.tileCenters[6] = [-0.5*s,0,-0.5*s,1];
	this.tileCenters[7] = [0.5*s,0,-0.5*s,1];
	this.tileCenters[8] = [1.5*s,0,-0.5*s,1];
	
	this.tileCenters[10] = [-1.5*s,0,0.5*s,1];
	this.tileCenters[11] = [-0.5*s,0,0.5*s,1];
	this.tileCenters[12] = [0.5*s,0,0.5*s,1];
	this.tileCenters[13] = [1.5*s,0,0.5*s,1];
	
	this.tileCenters[15] = [-1.5*s,0,1.5*s,1];
	this.tileCenters[16] = [-0.5*s,0,1.5*s,1];
	this.tileCenters[17] = [0.5*s,0,1.5*s,1];
	this.tileCenters[18] = [1.5*s,0,1.5*s,1];

	/**
	 * define a colour for every face
	 * @property facesColour
	 * @type array
	 */
	var i = 0;
	this.facesColour = new Array(41);
	for(i = 0; i < 8; i+=1) {
		this.facesColour[i] = 'black';
	}
	this.facesColour[8] ='rgba(135,206,250,0.2)';//'tan';
	this.facesColour[9] ='rgba(135,206,250,0.2)';//'tan';
	for(i = 10; i < 26; i+=1) {
		this.facesColour[i] = 'rgba(0,0,139,0.3)';//'saddlebrown';
	}
};

/**
 * inherit from Shape3D class
 * @method prototype
 */
GOBBLET.Board3D.prototype = new GOBBLET.Shape3D();

/**
* Pawn wants to move to a new position on the board 
* check if this is a valid position
* @method isValidPosition
* @return the index of the chosen board box
*/
GOBBLET.Board3D.prototype.isValidPosition = function(x, y) {
	var p, padding, padding2, xBoard, dBoard,
		i = 0,
	    j = 0;
	/*
	#0##1##2##3 ##4
	########### ###
	#5##6##7##8 ##9
	########### ###
	10#11#12#13 #14
	########### ###
	15#16#17#18 #19
	
	########### ###
	20#21#22#23 #24
	*/
	if(x > this.points[4][0]) {
		return -1;
	}
	
	if( x > this.points[3][0]) {
		i = 3;
	}
	else if( x > this.points[2][0]) {
		i = 2;
	}
	else if( x > this.points[1][0]) {
		i = 1;
	}
	else if( x > this.points[0][0]) {
		i = 0;
	}
	else {
		return -1;
	}
	
	if(y > this.points[20][2]) {
		return -1;
	}
	
	if(y > this.points[15][2]) {
		j = 15;
	}
	else if(y > this.points[10][2]) {
		j = 10;
	}
	else if(y > this.points[5][2]) {
		j = 5;
	}
	else if(y > this.points[0][2]) {
		j = 0;
	}
	else {
		return -1;
	}
	p = i + j;
	padding = this.tileSize / 4;
	padding2 = this.tileSize - padding;
	xBoard = this.points[p][0];
	dBoard = this.points[p][2];
	
	if(x < (xBoard + padding) || y < (dBoard + padding)) {
		return -1;
	}
	if(x > (xBoard + padding2) || y > (dBoard + padding2)) {
		return -1;
	}
	return p;
};