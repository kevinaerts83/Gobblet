var GOBBLET = GOBBLET || {};

/**
 * Slider class
 * @class Slider
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.Slider = function(canvasX, canvasY, horizontal) {
	var w, margin = 4;
	this.horizontal = horizontal;
	this.normalWindow = canvasX > canvasY;
	if(horizontal) {
		this.offsetX = 30;
		this.offsetY = 5;
		this.sliderHeight = 25;
		w = canvasX/10;
		
		this.x = (canvasX-w)/2;
		this.y = canvasY - (this.sliderHeight - margin);
		this.w = w;
		this.h = this.sliderHeight - margin*2 - this.offsetY;
		this.totalWidth = (this.x - this.offsetX) * 2;
	} else {
		this.offsetX = 5;
		this.offsetY = 30;
		this.sliderHeight = canvasY/10;
		w = 25;
		
		this.x = canvasX - (w - this.offsetX);
		this.y = (canvasY - this.sliderHeight)/2;
		this.w = w - margin*2 - this.offsetX;
		this.h = this.sliderHeight;
		this.totalHeight = (this.y - this.offsetY) * 2;
	}
	this.angle = 0;
	this.setAngle();
};

/**
* Setter
* @method set
*/
GOBBLET.Slider.prototype.translate = function(newX, newY) {
	if(this.offsetX) {
		if(newX >= this.offsetX && newX <= (this.totalWidth + this.offsetX)) {
			this.x = newX;
		}
	}
	if(this.offsetY) {
		if(newY >= this.offsetY && newY <= (this.totalHeight + this.offsetY)) {
			this.y = newY;
		}
	}
	this.setAngle();
};

/**
 * Draw the shape
 * @method draw
 */
GOBBLET.Slider.prototype.draw = function(ctx) {
	ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    if(this.horizontal) {
	    ctx.lineTo(this.x + this.w, this.y);
	    ctx.arc(this.x + this.w, this.y + this.h / 2, this.h / 2, 1.5 * Math.PI, 0.5 * Math.PI, false);
	    ctx.lineTo(this.x, this.y + this.h);
	    ctx.arc(this.x, this.y + this.h / 2, this.h / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);
    } else {
    	ctx.lineTo(this.x, this.y + this.h);
    	ctx.arc(this.x + this.w / 2, this.y + this.h, this.w / 2, Math.PI, 0, true);
        ctx.lineTo(this.x + this.w, this.y);
        ctx.arc(this.x + this.w / 2, this.y, this.w / 2, 0, Math.PI, true);
    }
    //ctx.fillRect (this.x,this.y,this.w, this.h);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = "rgba(135,206,250,0.2)"; 
    ctx.fill();
};

/**
 * Calculate angle
 * @method draw
 */
GOBBLET.Slider.prototype.getAngle = function() {
	return this.angle;
};
GOBBLET.Slider.prototype.setAngle = function() {
	var a;
	if(this.horizontal) {
		a = (this.normalWindow) ? 360 : 180;
		this.angle = ((this.x-this.offsetX) * a)/this.totalWidth;
	} else {
		a = ((this.y-this.offsetY)*360)/this.totalHeight;
		//reduce angle
		this.angle = (a*55/180);
	}
};
/**
 * Determine if a point is inside the shape's bounds
 * @method contains
 */
GOBBLET.Slider.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Height) and its Y and (Y + Height)
  return (this.x <= mx) && (this.x + this.w >= mx) && (this.y <= my) && (this.y + this.h >= my);
};