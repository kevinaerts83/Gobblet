var GOBBLET = GOBBLET || {};

/**
 * State class
 * @constructor
 * @namespace GOBBLET
 * @class state
 */
GOBBLET.State = function(canvas) {
	/**
	 * Canvas object
	 * @prototype canvas
	 * @type canvas element
	 */
	this.canvas = canvas;
	/* parameters */
	this.cWidth = canvas.width;
	this.cHeight = canvas.height;
	this.scale = 100;
	this.ctx = canvas.getContext('2d');
	// This complicates things a little but fixes mouse co-ordinate problems
	// when there's a border or padding. See getMouse for more detail
	if (document.defaultView && document.defaultView.getComputedStyle) {
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingLeft, 10)      || 0;
		this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingTop, 10)       || 0;
		this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null).borderLeftWidth, 10)  || 0;
		this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null).borderTopWidth, 10)   || 0;
	}
	// Some pages have fixed-position bars (like the stumble upon bar) at the top or left of the page
	// They will mess up mouse coordinates and this fixes this
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;
	this.touchedPointsDistance = 0;
	
	this.valid = false; // when set to false, the canvas will redraw everything
	this.recalculate = true; //recalculate all 2d points
	this.animationSelection = 0; //0 nothing, 1 up, 2 down, 3 back
	this.startAnimation = false;
	this.sliders = [];  // the collection of things to be drawn
	this.sliders[0] = new GOBBLET.Slider(this.cWidth, this.cHeight, true);
	this.sliders[1] = new GOBBLET.Slider(this.cWidth, this.cHeight, false);
	
	this.matrix = new GOBBLET.Matrix(this.cWidth, this.cHeight);
	this.rotMatrix = this.matrix.getRotationMatrix(this.sliders[1].getAngle(), this.sliders[0].getAngle());
	var tileSize = ((this.cWidth < this.cHeight ? this.cWidth : this.cHeight) - 10)/(8 * Math.sin(Math.PI/4));//10 padding;
	this.tileSize = tileSize;
	this.currentPlayer = 0;
	this.ai = new GOBBLET.AI();
	this.ai.level = level;
	/*** SHAPES ***/
	/*Board*/
	this.a3DBoard = new GOBBLET.Board3D(tileSize, this.matrix);
	this.board = new GOBBLET.Board(this.matrix, this.cWidth/2, this.cHeight/2, 0);
	this.board.shape3D = this.a3DBoard;
	this.board.facesColour = this.a3DBoard.facesColour;
	/*Pawn*/
	this.cube = new GOBBLET.Cube(tileSize, this.matrix);
	this.pawns = [];
	this.shapes = [];
	
	this.dragging = false; // Keep track of when we are dragging
	this.selection = undefined;
	this.undoPawn = -1;
	this.invalidMoveCache = 0;
	
	/*** Game ***/
	this.boardState = [[0,0,0,0],[0,0,0,0],[0,0,0,0]];//Player1, Player2, Both
	
	var theState = this;
	
	canvas.addEventListener('click', function(event) {
	    if(event.pageX < 20 && event.pageY < 25) {
	    	WELCOME.ShowMenu();
	    }
	}, false);
	canvas.addEventListener('touchstart', function(event) {
	    if(event.touches[0].pageX < 20 && event.touches[0].pageY < 25) {
	    	WELCOME.ShowMenu();
	    	event.preventDefault();
	    }
	}, false);

	// Up, down, and move are for dragging
	canvas.addEventListener('mousedown', function(e) {
		if(theState.enableMouse(theState)) {
			if(!theState.startAnimation) {
				  var mouse = theState.getMouse(e.pageX, e.pageY, theState);
				  theState.onDown(e, theState, mouse.x, mouse.y); 
			}
		}
	}, true);
	canvas.addEventListener('mousemove', function(e) {
		if(theState.enableMouse(theState)) {
			if (theState.dragging) {
				var mouse = theState.getMouse(e.pageX, e.pageY, theState);
				theState.onMove(e, theState, mouse.x, mouse.y); 
			}
		}
	}, true);
	canvas.addEventListener('mouseup', function(e) {
		if(theState.enableMouse(theState)) {
			theState.onUp(e, theState); 
		}
	}, true);
	canvas.addEventListener("touchstart", function(e) {
		if(theState.enableMouse(theState)) {
			e.preventDefault();
			if((theState.selection === undefined) && !theState.startAnimation) {
				var touches = e.touches;
				switch(touches.length) {
				case 1:
					var mouse = theState.getMouse(touches[0].pageX, touches[0].pageY, theState);
					theState.onDown(e, theState, mouse.x, mouse.y);
					break;
				case 2:
					theState.touchedPointsDistance = theState.pythagoras(
							theState.absoluteMin(touches[0].pageX, touches[1].pageX),
							theState.absoluteMin(touches[0].pageY, touches[1].pageY));
					break;
				default:
					break;
				}
			}
		}
	}, false);
	canvas.addEventListener("touchmove", function(e) {
		if(theState.enableMouse(theState)) {
			e.preventDefault();
			var touches = e.touches;
			if (theState.dragging && (touches.length === 1)) {
				var mouse = theState.getMouse(touches[0].pageX, touches[0].pageY, theState);
				theState.onMove(e, theState, mouse.x, mouse.y);
			}
			if(touches.length === 2) {
				if(theState.touchedPointsDistance > 0) {
					var tpd = theState.pythagoras(
							theState.absoluteMin(touches[0].pageX, touches[1].pageX),
							theState.absoluteMin(touches[0].pageY, touches[1].pageY));
	
					theState.scale += (tpd > theState.touchedPointsDistance) ? 1 : -1;
					if(theState.scale < 0) {
						theState.scale = 0;
					}
					theState.recalculate = true;
					theState.valid = false;
				}
			}
		}
	}, false);
	canvas.addEventListener("touchend", function(e) {
		if(theState.enableMouse(theState)) {
			e.preventDefault();
			this.touchedPointsDistance = 0;
			theState.onUp(e, theState);
		}
	}, false);
	canvas.addEventListener("touchcancel", function(e) {
		if(theState.enableMouse(theState)) {
			e.preventDefault();
			this.touchedPointsDistance = 0;
			theState.onUp(e, theState); 
		}
	}, false);
	canvas.addEventListener('DOMMouseScroll', function(e) { theState.mousewheel(e, theState); }, true);
	canvas.addEventListener('mousewheel', function(e) { theState.mousewheel(e, theState); }, true);
	
	return theState;
};
/**
 * Initialize Shapes
 * @method init
 */
GOBBLET.State.prototype.enableMouse = function(theState) {
	if(isView) {
		return true;
	} else {
		if(theState.ai.level === 3) {
			if(remoteEnabled) {
				return (theState.currentPlayer === remotePlayer);
			} else {
				return false;
			}
		} else {
			return ((humanPlayer === 1) || (theState.currentPlayer === 0));
		}
	}
};
/**
 * Initialize Shapes
 * @method init
 */
GOBBLET.State.prototype.init = function() {
	this.initPawns(this.tileSize);
	this.shapes = this.pawns.concat(this.sliders);
};
/**
 * Check if player won
 * @method initPawns
 */
GOBBLET.State.prototype.checkWinner = function(player) {
	var number, i, mask, chkPlayer = [], won = false, winner = this.boardState[player], loser = this.boardState[(player ^ 1)];
	chkPlayer[0] = winner[0];
	chkPlayer[1] = (winner[1] ^ loser[0]) & winner[1];
	chkPlayer[2] = (winner[2] ^ (loser[0] | loser[1])) & winner[2];
	chkPlayer[3] = (winner[3] ^ (loser[0] | loser[1] | loser[2])) & winner[3];
	
	number = chkPlayer[0] | chkPlayer[1] | chkPlayer[2] | chkPlayer[3];
	
	mask = [61440, 3840, 240, 15, 34952, 17476, 8738, 4369, 33825, 4680];
	/*1111 0000 0000 0000
	  0000 1111 0000 0000
	  0000 0000 1111 0000
	  0000 0000 0000 1111
	  1000 1000 1000 1000
	  0100 0100 0100 0100
	  0010 0010 0010 0010
	  0001 0001 0001 0001
	  1000 0100 0010 0001
	  0001 0010 0100 1000*/
	for(i = 0; i < 10; i++) {
		if((mask[i] & number) === mask[i]) {
			won = true;
			break;
		}
	}
	return won;
};

/**
 * Initialize the pawns
 * @method initPawns
 */
GOBBLET.State.prototype.initPawns = function(tileSize) {
	var i, j, k, z,
		n = 0,
		color1 = ['#FFEFDB'],//['red', 'red', 'blue', 'blue', 'yellow', 'yellow', 'white', 'white', 'green', 'green'], 
		color2 = ['#003955'],//#282828//#003333
		pawn_x = (this.cWidth / 2) + (tileSize * -3.5) + this.cube.w,
		pawn_x2 = (this.cWidth / 2) + (tileSize * 2.5) + this.cube.w,
		pawn_y = (this.cHeight / 2) + 10,
		pawn_z = tileSize + this.cube.d;
		
	for(i=0; i < 3; i+=1) {
		z = (i === 0) ? pawn_z : ((i === 1) ? 0 : -pawn_z);
		for(k=0; k < 2; k+=1) {
			for(j=0; j < 4; j+=1) {
				this.pawns[n] = new GOBBLET.Pawn(this.matrix, (k ? pawn_x : pawn_x2), pawn_y, z, this.cube.h, this.cube.w, j, (this.currentPlayer ? k : (k ^ 1)), n);
				this.pawns[n].shape3D = this.cube;
				this.pawns[n].facesColour = (k ? color1 : color2);
				this.pawns[n].percent = (k ? -50 : -10);
				this.on('mouseEvent', this.pawns[n].notification, this.pawns[n]);
				this.on('endEvent', this.pawns[n].endEvent, this.pawns[n]);
				n += 1;
			}
		}
	}
};

/**
 * absolute Min
 * @method absoluteMin
 */
GOBBLET.State.prototype.absoluteMin = function(x1, x2) {
	return x1 > x2 ? (x1-x2) : (x2-x1);
};

/**
 * Pythagoras
 * @method pythagoras
 */
GOBBLET.State.prototype.pythagoras = function(a, b) {
	return Math.sqrt(a*a + b*b);
};


/**
 * Down
 * @method onDown
 */
GOBBLET.State.prototype.onDown = function(e, theState, mx, my) {
	//slice takes a deep copy of boardState[2]
	var pawnSize, current, p1, p2, maskTile, shapes = theState.shapes, bothStates = (theState.boardState[2]).slice(0);
	for (var i = shapes.length-1; i >= 0; i--) {
		if((shapes[i].visible && shapes[i].enable && shapes[i].isTurn) || (shapes[i].horizontal !== undefined) || isView) {
			//find the shape that is clicked upon
			if (shapes[i].contains(mx, my)) {
				theState.dragging = true;
				theState.selection = shapes[i];
				theState.valid = false;
				if(shapes[i].horizontal === undefined) {
					pawnSize = shapes[i].size;
					maskTile = theState.a3DBoard.aHashMap[shapes[i].tile];
					if(isView) {
						current = ((theState.boardState[0][pawnSize] & maskTile) > 0) ? 0 : 1;
					} else {
						current = theState.currentPlayer;
					}
					p1 = theState.boardState[current][pawnSize];
					p2 = theState.boardState[(current^1)][pawnSize];
					if(shapes[i].onTheBoard) {
						p1 ^= maskTile; //clear tile
					} else {
						if(((i+1) % 4) !== 0) {
							//make the pawn underneath visible in the stack
							shapes[i+1].visible = true;
						}
					}
					bothStates[pawnSize] = p1 | p2;
					theState.animationSelection = 1;
					theState.fire('mouseEvent', [false, true, bothStates, true]);
				}
				theState.recalculate = true;
				return; //quit function on selection
			}
		}
	}
	// haven't returned means we have failed to select anything.
	// If there was an object selected, deselect it
	if (theState.selection) {
		delete theState.selection;
		theState.valid = false;
	}
};

/**
 * Move
 * @method onMove
 */
GOBBLET.State.prototype.onMove = function(e, theState, mx, my) {
	if(theState.selection) {
	    if(theState.selection.horizontal || theState.selection.horizontal===false) {
	    	theState.selection.translate(mx, my);
			theState.rotMatrix = theState.matrix.getRotationMatrix(theState.sliders[1].getAngle(), theState.sliders[0].getAngle());
	    	theState.recalculate = true;
	    } else {
	    	theState.selection.move(mx, my, theState.sliders[0].getAngle());
	  	}
	}
	theState.valid = false; // Something's dragging so we must redraw
};

/**
 * Up
 * @method onUp
 */
GOBBLET.State.prototype.onUp = function(e, theState) {
	var p, i, pawnSize;
	theState.invalidMoveCache = 0;
	if(theState.selection) {
		if(theState.selection.horizontal === undefined) {
			if(isView) {
				theState.animationSelection = 3;
			} else {
				//p = UPPER LEFT CORNER of tile
				p = theState.a3DBoard.isValidPosition(theState.selection.centerPoint[0] - theState.cWidth/2,theState.selection.centerPoint[2]);
				//check if there is already a bigger or equal pawn or same position
				if(theState.selection.tile > -1 && theState.selection.tile === p) {
					p = -1;
				}
				pawnSize = theState.selection.size;
				if(p >= 0) {
					for(i=0; i <= pawnSize; i++) {
						if(theState.boardState[2][i] & theState.a3DBoard.aHashMap[p]) {
							p = -1;
							break;
						}
					}
				}
				//move pawn
				if(p >= 0) {
					theState.movePawn(p, theState);
				} else {
					theState.fire('mouseEvent', [true, false, theState.boardState[2], theState.selection.onTheBoard]);
					theState.selection.enable = true;
					theState.invalidMoveCache = 1;
					if(theState.selection.onTheBoard === false) {
						for(i = 0, l = theState.shapes.length; i < l; i++) {
							if(theState.shapes[i] === theState.selection) {
								if((i+1) % 4 !== 0) {
									theState.undoPawn = i+1;
									break;
								}
							}
						}
					} else {
						theState.undoPawn = 1;
					}
					theState.animationSelection = 3;
				}
			}
		} else {
			delete theState.selection;
		}
	}
	theState.dragging = false;
};

/**
 * Zoom
 * @method mousewheel
 */
GOBBLET.State.prototype.mousewheel = function(e, theState) {
	e = e ? e : window.event;
	var wheel = 0,	
		w = e.wheelDelta,
		d = e.detail;
	
	if (d) {
		if (w) {
			wheel = w/d/40*d>0?1:-1; // Opera
		}
		else {
			wheel = -d/3;// Firefox;
		}
	}
	else {
		wheel = w/120;
	}
	theState.scale += wheel > 0 ? 5 : -5;
	if(theState.scale < 0) {
		theState.scale = 0;
	}
	theState.recalculate = true;
	theState.valid = false; // Something's zoomed so we must redraw
};

/**
 * put pawn in center of the tile
 * @method movePawn
 */
GOBBLET.State.prototype.movePawn = function(tile, theState) {
	var endPoint, pawnSize = theState.selection.size;
	
	//Clear previous position
	if(theState.selection.tile > -1) {
		theState.boardState[theState.currentPlayer][pawnSize] ^= theState.a3DBoard.aHashMap[theState.selection.tile];
	}
	//Set new position
	theState.selection.tile = tile;
	theState.boardState[this.currentPlayer][pawnSize] |= theState.a3DBoard.aHashMap[tile];
	theState.boardState[2][pawnSize] = theState.boardState[0][pawnSize] | theState.boardState[1][pawnSize];
	
	//Notify all pawns of new position 
	theState.fire('mouseEvent', [true, true, theState.boardState[2], true]);
	
	//Locate selected pawn in center of tile
	endPoint = theState.a3DBoard.tileCenters[tile];
	endPoint = theState.matrix.multiplyPointAndMatrix(endPoint, theState.matrix.inverseTranslation);

	theState.selection.endX = endPoint[0];
	theState.selection.endZ = endPoint[2];
	
	theState.animationSelection = 3;
	theState.selection.onTheBoard = true;
};

/**
 * Get the coordinates of the mouse
 * @method getMouse
 */
GOBBLET.State.prototype.getMouse = function(px, py, theState) {
	var element = theState.canvas,
	offsetX = 0,
	offsetY = 0,
	mx,
	my;
	if (element.offsetParent !== undefined) {
	  do {
	    offsetX += element.offsetLeft;
	    offsetY += element.offsetTop;
	  } while ((element = element.offsetParent));
	}
	offsetX += theState.stylePaddingLeft + theState.styleBorderLeft + theState.htmlLeft;
	offsetY += theState.stylePaddingTop + theState.styleBorderTop + theState.htmlTop;
	mx = px - offsetX;
	my = py - offsetY;
	return {x: mx, y: my};
};