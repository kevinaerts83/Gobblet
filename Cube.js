var GOBBLET = GOBBLET || {};
/**
 * Cube class
 * @class Cube
 * @param {int} tileSize size of one board plane
 * @param {array} matrix Our matrix object with defined center
 */
GOBBLET.Cube = function(tileSize, matrix) {
	var face0_b1, face1_b2, face4_r1, face5_r2, face6_u1, face7_u2, face8_l1, face9_l2, face10_f1, face11_f2;
	var w = (((tileSize - 5) / 2) >> 0), h = (((tileSize * 1.3) / 2) >> 0), d = w;

	this.w = w;
	this.h = h;
	this.d = d;
	
	/**
	 * define 8 points of the cube
	 * @property points
	 * @type array
	 * 
	 *       	4#######5    
	 *       	##      -#
	 *       	# #     - #
	 *       	#  7#######6
	 *       	#  #    -  #
	 *       	#  #    -  #
	 *       	#  #    -  #
	 *       	0--#----1  #  
	 *       	 # #     - #
	 *       	  ##      -#
	 *       	   3#######2
	*/
	this.points[0] = [w,h,d,1];
	this.points[1] = [-w,h,d,1];
	this.points[2] = [-w,h,-d,1];
	this.points[3] = [w,h,-d,1];
	this.points[4] = [w/2,-h,d/2,1];
	this.points[5] = [-w/2,-h,d/2,1];
	this.points[6] = [-w/2,-h,-d/2,1];
	this.points[7] = [w/2,-h,-d/2,1];
	
	/**
	 * matrix constructed with the center of the cube
	 * @property matrix
	 * @type object
	 */
	this.matrix = matrix;
	
	/*
	 * Combine all points with triangles faces so a cube will be formed.
	 * If the dot product of the 2 vectors of this triangular is smaller than zero 
	 * (points away from the center) the face is visible.
	 * To make this work: 
	 * - Move around the shape and look at triangular when it is visible. 
	 * - Now add the points to the array of the shape counterclockwise.
	 * - To calculate the dot vector take point 0 of the triangular and draw a vector to point 1
	 *   this vector will point counterclockwise. The second vector is from point 0 to point 2 and will point clockwise.
	 * EXAMPLE:
	 * the front face: points 2 - 7 - 3 (counterclockwise). vector1= 2-7; vector2 = 2-3
	 * the back face: points 1 - 0 - 4 (counterclockwise) look at it from the back. vector1= 1-0; vector2 = 1-4 
	 * Now the right hand rule says (vector1 = index finger, vector2 = middle finger; dot product = thumb)
	 * With the front face the thumb points away from the center, and with the back face the thumb points to the center.
	 */
	//back
	face0_b1 = [1, 0, 4, 0];
	face1_b2 = [4, 5, 1, 0];
	//down
	//  var face2_d1 = [2, 3, 0];
	//  var face3_d2 = [0, 1, 2];
	//right
	face4_r1 = [2, 1, 5, 0];
	face5_r2 = [5, 6, 2, 0];
	//up
	face6_u1 = [7, 6, 5, 0];
	face7_u2 = [5, 4, 7, 0];
	//left
	face8_l1 = [0, 3, 7, 0];
	face9_l2 = [7, 4, 0, 0];
	//front
	face10_f1 = [3, 2, 6, 1];
	face11_f2 = [6, 7, 3, 1];
	
	this.faces = [face0_b1, face1_b2, face4_r1, face5_r2, face6_u1, face7_u2, face8_l1, face9_l2, face10_f1, face11_f2];//, face2_d1, face3_d2
};

/**
 * inherit from Shape3D class
 * @method prototype
 */
GOBBLET.Cube.prototype = new GOBBLET.Shape3D();
