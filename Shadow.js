var GOBBLET = GOBBLET || {};
/**
 * Shadow class
 * 2D figure
 * @class Shadow
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.Shadow = function() {
};

/**
 * Draw shadow
 * @method draw
 * @namespace GOBBLET
 * @param {2d context} ctx The context
 */
GOBBLET.Shadow.prototype.draw = function(ctx, pawn, scale, rotMatrix) {
	//unlift centerpoint
	var newY = pawn.matrix.inverseTranslation[1][3] - pawn.pHeight-5,
	 cp_3D = [pawn.centerPoint[0], newY, pawn.centerPoint[2], 1], //3d center point
	 cp_2D = this.zoomAndRotate(scale, rotMatrix, pawn.matrix, cp_3D), //2d center point
	 points_2d = this.translateAndProject(pawn, cp_2D); //translate and project
	
	//draw
	if(ctx) {
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.beginPath();
	    ctx.moveTo(points_2d[0][0], points_2d[0][1]);
	    ctx.lineTo(points_2d[1][0], points_2d[1][1]);
	    ctx.lineTo(points_2d[2][0], points_2d[2][1]);
	    ctx.lineTo(points_2d[3][0], points_2d[3][1]);
	    ctx.closePath();
	    ctx.fillStyle = 'rgba(70,70,70,0.6)';
	    ctx.fill();
	}
};

GOBBLET.Shadow.prototype.zoomAndRotate = function(scale, rotMatrix, matrix, cp) {
	var p = [cp[0], cp[1], cp[2] , 1];
	if(rotMatrix) {
		p = matrix.multiplyPointAndMatrix(p, matrix.translation);
		p = matrix.multiplyPointAndMatrix(p, matrix.getScaling(scale /100.0));
		p = matrix.multiplyPointAndMatrix(p, rotMatrix);
		p = matrix.multiplyPointAndMatrix(p, matrix.inverseTranslation);
	}
	return p;
};

GOBBLET.Shadow.prototype.translateAndProject = function(pawn, cp) {
	var i, l, points_2d = [],
		translation = pawn.matrix.getTranslation(cp[0], cp[1], cp[2]);
	for (i = 0, l = pawn.shape3D.cache[pawn.size].length; i < l; i+=1) {
		points_2d[i] = pawn.matrix.projectPoint(pawn.matrix.multiplyPointAndMatrix(pawn.shape3D.cache[pawn.size][i], translation));
	}
	return points_2d;
};