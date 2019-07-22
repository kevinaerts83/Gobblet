var GOBBLET = GOBBLET || {};

/**
 * Shape class
 * @class Shape
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.Shape = function() {
	/* this documents the members of Shape that should be provided by the child classes.
	this.shape3D = null;
	this.matrix = null;
	this.facesColour = '';
	
	//points_2d are the cached 3d points (see shape3D) + translated and projected.
	this.points_2d = [];
	this.centerPoint2D = [];
	
	this.mouseX = 0;
	this.mouseY = 0;
	this.size = 0;
	
	this.minX = 0;
	this.minY = 0;
	this.maxX = 0;
	this.maxY = 0;*/
	this.percent = 0;
};

/**
* Translate 3d shape to it's 2d position and shape
* @method translate
*/
GOBBLET.Shape.prototype.translateAndProject = function() {
	this.points_2d = [];
	var i, l, translation, 
		isPawn = false,
		c = 0;
	if(this.size !== undefined) {
		isPawn = true;
		c = this.size;
	}
	if(!isPawn || this.visible === true) {
		translation = this.matrix.getTranslation(this.centerPoint2D[0], this.centerPoint2D[1], this.centerPoint2D[2]);
		for (i = 0, l = this.shape3D.cache[c].length; i < l; i+=1) {
			this.points_2d[i] = this.matrix.projectPoint(this.matrix.multiplyPointAndMatrix(this.shape3D.cache[c][i], translation));
			if(isPawn) {
				this.setBoundaries(this.points_2d[i], i===0);
			}
		}
	}
};

/**
 * Darker color
 * @method darkerColor
 * @namespace GOBBLET
 */
GOBBLET.Shape.prototype.darkerColor = function(color, prc) {
	if(prc !== 0) {
	    var num = parseInt(color.slice(1),16), 
	    	amt = Math.round(2.55 * prc), 
		    R = (num >> 16) + amt, 
		    G = (num >> 8 & 0x00FF) + amt, 
		    B = (num & 0x0000FF) + amt;
	    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
	}
	return color;
};

/**
 * Draw shape
 * @method draw
 * @namespace GOBBLET
 * @param {2d context} ctx The context
 */
GOBBLET.Shape.prototype.draw = function(ctx, isSelection) {
	if(ctx && this.points_2d.length > 0 && (this.visible === undefined || this.visible === true)) {
		var i, l, face, colourLength = this.facesColour.length-1;
		ctx.lineWidth = 1;
		if(isSelection) {
			ctx.strokeStyle = this.darkerColor(this.facesColour[0], this.percent*2);
		} else {
			ctx.strokeStyle = (this.facesColour.length > 1) ? '#000' : this.darkerColor(this.facesColour[0], this.percent);
		}
		ctx.lineWidth= (this.facesColour.length > 1) ? 1 : 2;
		for (i = 0, l = this.shape3D.faces.length; i < l; i+=1) {
			face = this.shape3D.faces[i];
			
			face[3] = this.dotProduct(face, this.points_2d) ? 1 : 0;
			if(face[3] === 1) {
				ctx.fillStyle = this.facesColour[i > colourLength ? colourLength : i];
				ctx.beginPath();
			    ctx.moveTo(this.points_2d[face[0]][0],this.points_2d[face[0]][1]);
			    ctx.lineTo(this.points_2d[face[1]][0],this.points_2d[face[1]][1]);
			    ctx.lineTo(this.points_2d[face[2]][0],this.points_2d[face[2]][1]);
			    ctx.stroke();
			    
			    //SELECTION
			    /*ctx.shadowColor = '#ffffff';
			    ctx.shadowBlur = 40;
			    ctx.shadowOffsetX = 0;
			    ctx.shadowOffsetY = 0;*/
			    
			    ctx.fill();
			}
		}
		
		/*REMOVE
		ctx.rect(this.minX, this.minY, this.maxX-this.minX, this.maxY-this.minY);
		ctx.stroke();
		
		ctx.fillStyle = '#000';
		ctx.font = 'italic bold 10px sans-serif';
		for(var i = 0, l = this.points_2d.length; i < l; i++) {
			ctx.fillText(i, this.points_2d[i][0], this.points_2d[i][1]);
		}
		//END*/
	}
};

/**
 * Calculate the dot product of the face
 * dot product => determine how similar two vectors point to the same point (same direction = 1;  90 degrees = 0; opposite direction = -1)
 * or simply put the cosine between two vectors
 * @method dotProduct
 * @namespace GOBBLET
 * @param {array} points The 2d points of the shape
 * @param {array} face An array with indexes of the points of the face 
 */
GOBBLET.Shape.prototype.dotProduct = function(face, p) {
	var a1 = p[face[1]][0] - p[face[0]][0],
		a2 = p[face[1]][1] - p[face[0]][1],
		b1 = p[face[2]][0] - p[face[0]][0],
		b2 = p[face[2]][1] - p[face[0]][1];
	
	return (a1*b2 - a2*b1) < 0;
};

/**
 * Determine the boundaries of a shape
 * @method contains
 */
GOBBLET.Shape.prototype.setBoundaries = function(point2d, first) {
	if(first) {
		this.minX = point2d[0];
		this.minY = point2d[1];
		this.maxX = point2d[0];
		this.maxY = point2d[1];
	}
	else {
		if(point2d[0] < this.minX) {
			this.minX = point2d[0];
		}
		if(point2d[0] > this.maxX) {
			this.maxX = point2d[0];
		}
		if(point2d[1] < this.minY) {
			this.minY = point2d[1];
		}
		if(point2d[1] > this.maxY) {
			this.maxY = point2d[1];
		}
	}
};

/**
 * Determine if a point is inside the shape's bounds
 * @method contains
 */
GOBBLET.Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Height) and its Y and (Y + Height)
  if((this.minX <= mx) && (this.maxX >= mx) && (this.minY <= my) && (this.maxY >= my)) {
	  this.mouseX = mx;
	  this.mouseY = my;
	  return true;
  }
  
  this.mouseX = -1;
  this.mouseY = -1;
  return false;
};