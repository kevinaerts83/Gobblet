/**
 * My javascript application
 * @module gobblet
 */
var GOBBLET = GOBBLET || {};
var WELCOME = WELCOME || {};
var runningGame;
var currentGame;
var previousPlayer = 1;
var remotePawn = -1;
var remoteTile = -1;
var remotePlayer = 0;
var remoteEnabled = 1;
/**
 * Start game
 */
GOBBLET.Start = function() {
	if(runningGame) {
		clearInterval(runningGame);
	}
	if(currentGame) {
		delete currentGame.myState;
		delete currentGame;
	}
	currentGame = new GOBBLET.Game();
	currentGame.init();
};

/**
 * Game class
 * @class game
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.Game = function() {
	this.interval = 80;
	this.animationId = 0;
	this.stopAnimation = false;
	this.shadow = new GOBBLET.Shadow();
	/**
	 * State of the game
	 * @property myState
	 * @type object
	 */
	this.myState = null;
};

/**
 * Center Pawn
 * @method centerPawn
 */
GOBBLET.Game.prototype.centerPawn = function(x1, x2) {
	return (x1 > x2) ? (x2 + ((x1 - x2) / 2)) : (x1 + ((x2 - x1) / 2));
};

GOBBLET.Game.prototype.remoteMove = function (state, fnc) {
	if(remotePawn > -1 && remoteTile > -1) {
		var w, cPawn, l = state.pawns.length;
		for(w = 0; w < l; w++) {
			if(state.pawns[w].id === remotePawn) {
				cPawn = state.pawns[w];
				state.ai.nextMove = remoteTile;
				state.onDown(null, state, fnc(cPawn.minX, cPawn.maxX), fnc(cPawn.minY, cPawn.maxY));
				break;
			}
		}
		remotePawn = -1;
		remoteTile = -1;
	}
};
/**
 * initialize the game class
 * @method init
 */
GOBBLET.Game.prototype.init = function () {
	var myCtx,
		canvas = document.getElementById("canvas");
	
	if (canvas.getContext) {
		this.myState = new GOBBLET.State(canvas);
		makePublisher(this.myState);
		previousPlayer ^= 1;
		this.myState.currentPlayer = previousPlayer;
		this.myState.init();
		//Start game
		//the meaning of 'this' changes so we save it in a variable so it always points to the game context.
		myCtx = this;
		myCtx.draw();
		
		if((humanPlayer === 0) && (myCtx.myState.currentPlayer === 1)) {
			//if computer starts
			myCtx.myState.ai.move(myCtx.myState.boardState, myCtx.myState.pawns);
			var cPawn = myCtx.myState.ai.pawn;
			myCtx.myState.onDown(null, myCtx.myState, myCtx.centerPawn(cPawn.minX, cPawn.maxX), myCtx.centerPawn(cPawn.minY, cPawn.maxY));
		}
		
		runningGame = setInterval(function() {
			if(myCtx.stopAnimation) {
				clearInterval(myCtx.animationId);
				myCtx.stopAnimation = false;
				myCtx.animationId = 0;
				myCtx.myState.animationSelection = 0;
				myCtx.myState.startAnimation = false;
				
				if((humanPlayer === 0) && (myCtx.myState.currentPlayer === 1)) {
					myCtx.myState.ai.move(myCtx.myState.boardState, myCtx.myState.pawns);
					var cPawn = myCtx.myState.ai.pawn;
					myCtx.myState.onDown(null, myCtx.myState, myCtx.centerPawn(cPawn.minX, cPawn.maxX), myCtx.centerPawn(cPawn.minY, cPawn.maxY));
				}
			} else {
				if(myCtx.myState.animationSelection !== 0 && !myCtx.myState.startAnimation) {
					if(myCtx.myState.selection) {
						myCtx.myState.startAnimation = true;
						myCtx.animation();
					}
				}
				if(myCtx.myState.ai.level === 3) {
					//REMOTE RECEIVE
					GOBBLET.Game.prototype.remoteMove(myCtx.myState, myCtx.centerPawn);
				}
			}
			if(!myCtx.myState.startAnimation) {
				myCtx.draw();
			}
		}, myCtx.interval);
	}
};

/**
 * Start animation of the selected pawn
 * @method animation
 * Case 1: lift pawn
 * Case 2: drop pawn
 * Case 3: move pawn to center before drop
 */
GOBBLET.Game.prototype.animation = function() {
	var aniCtx = this,
		liftValue = 15,
		won = false,
		myId = 0;
	
	myId = setInterval(function() {
		if(aniCtx.myState) {
			switch(aniCtx.myState.animationSelection) {
			case 0:
				clearInterval(myId);
				break;
			case 1:
				if(aniCtx.myState.selection.lift) {
					aniCtx.myState.selection.lift(-liftValue);
					if(aniCtx.myState.selection.centerPoint[1] <= (aniCtx.myState.board.centerPoint[1] - aniCtx.myState.tileSize*3)) {
						aniCtx.myState.animationSelection = 4;
					}
				}
				break;
			case 2:
				if(aniCtx.myState.selection && aniCtx.myState.selection.lift) {
					aniCtx.myState.selection.lift(liftValue);
					if(aniCtx.myState.board.centerPoint[1] < (aniCtx.myState.selection.centerPoint[1] + aniCtx.myState.selection.pHeight)) {
						aniCtx.stopAnimation = true;
						
						aniCtx.myState.selection.endMove(aniCtx.myState.board.centerPoint[1]);
						aniCtx.myState.recalculate = true;
						aniCtx.myState.valid = false;
						
						if(aniCtx.myState.selection.onTheBoard === false) {
							//Invalid move, pawn put back in the stack, hide underlying pawn
							aniCtx.myState.selection.lift(liftValue);
							if(aniCtx.myState.undoPawn >= 0) {
								aniCtx.myState.shapes[aniCtx.myState.undoPawn].visible = false;
								aniCtx.myState.undoPawn = -1;
							}
						} else {
							if((aniCtx.myState.ai.level === 3) && (aniCtx.myState.currentPlayer === remotePlayer)) {
								//REMOTE SEND
								webRtcDoMove(aniCtx.myState.selection.id, aniCtx.myState.selection.tile);
							}
							if(aniCtx.myState.undoPawn < 0) {
								aniCtx.myState.currentPlayer ^= 1;
							}
							aniCtx.myState.undoPawn = -1;
						}
						delete aniCtx.myState.selection;
						aniCtx.myState.fire('endEvent', []);
						
						if(!isView) {
							if(won === false) { //check won === false because this is not thread safe
								if(aniCtx.myState.checkWinner(0)) {
									won = true;
									WELCOME.IncreaseScore("0");
								}
								if(aniCtx.myState.checkWinner(1)) {
									won = true;
									WELCOME.IncreaseScore("1");
								}
							}
						}
						if(won) {
							aniCtx.myState.currentPlayer = -1;
							WELCOME.ShowMenu();
						}
					}
				}
				break;
			case 3:
				var tX = aniCtx.myState.selection.endX - aniCtx.myState.selection.centerPoint[0];
				var tZ = aniCtx.myState.selection.endZ - aniCtx.myState.selection.centerPoint[2];
				aniCtx.myState.selection.centerPoint[0] += (tX > 0 ? (tX > 10 ? 10 : tX) : (tX < -10 ? -10 : tX));
				aniCtx.myState.selection.centerPoint[2] += (tZ > 0 ? (tZ > 10 ? 10 : tZ) : (tZ < -10 ? -10 : tZ));
				if(tX > -10 && tX < 10 && tZ > -10 && tZ < 10) {
					aniCtx.myState.animationSelection = 2;
				}
				break;
			default:
				//wait for mouse up
				if((humanPlayer === 0) && (aniCtx.myState.currentPlayer === 1)) {
					aniCtx.myState.movePawn(aniCtx.myState.ai.nextMove, aniCtx.myState);
				}
				//REMOTE
				if((aniCtx.myState.ai.level === 3) && (aniCtx.myState.ai.nextMove > -1)) {
					aniCtx.myState.movePawn(aniCtx.myState.ai.nextMove, aniCtx.myState);
					aniCtx.myState.ai.nextMove = -1;
				}
				break;
			}
			aniCtx.draw();
		} else {
			clearInterval(myId);
		}
	}, 20);
	this.animationId = myId;
};

/**
 * Draw the board and the current state of the game
 * @method draw
 */
GOBBLET.Game.prototype.draw = function() {
	if(!this.myState.valid || this.myState.startAnimation) {
		this.clear();
		this.drawBackGround();

		var i, b, scale, smallerPawns, l = this.myState.pawns.length;
		for(b=0; b < 3; b++) {
			this.myState.ctx.beginPath();
			this.myState.ctx.arc(10,8+b*6,2,0,2*Math.PI);
			this.myState.ctx.fillStyle = 'black';
			this.myState.ctx.fill();
			this.myState.ctx.closePath();
		}
		//draw sliders	
		this.myState.sliders[0].draw(this.myState.ctx);
		this.myState.sliders[1].draw(this.myState.ctx);
		
		//draw board
		if(this.myState.recalculate) {
			this.myState.a3DBoard.rotate(this.myState.rotMatrix);
			//this.myState.a3DBoard.setVisibleFaces(this.myState.board.shape3D.faces, this.myState.cube.matrix);
			this.myState.cube.rotate(this.myState.rotMatrix);
			//this.myState.cube.setVisibleFaces(this.myState.pawns[0].shape3D.faces, this.myState.cube.matrix);
			
			if(this.myState.scale !== 100) {
				scale = this.myState.matrix.getScaling(this.myState.scale / 100.0);
				this.myState.a3DBoard.zoom(scale, 0);
				this.myState.cube.zoom(scale, 0);
			}
			smallerPawns = this.myState.matrix.getScaling(70 / 100.0);
			this.myState.cube.zoom(smallerPawns, 1);
			this.myState.cube.zoom(smallerPawns, 2);
			this.myState.cube.zoom(smallerPawns, 3);

			this.myState.board.translateAndProject();
			//this.myState.scale
		}
		this.myState.board.draw(this.myState.ctx);
		
		// calculate 2d points of pawns and determine the z-index
		for(i=0; i < l; i+=1) {
			if(this.myState.recalculate || (this.myState.selection === this.myState.pawns[i])) {
				this.myState.pawns[i].zoomAndRotate(this.myState.scale, this.myState.rotMatrix);
			}
		}
		
		//draw shadow
		if(this.myState.selection && this.myState.selection.size !== undefined) {
			this.shadow.draw(this.myState.ctx, this.myState.selection, this.myState.scale, this.myState.rotMatrix);
		}
		
		//draw pawns
		this.myState.pawns.sort(function(a, b) {return (a.z_index - b.z_index);});
		for(i=0; i < l; i+=1) {
			var isSelection = (this.myState.selection === this.myState.pawns[i]);
			if(this.myState.recalculate || isSelection) {
				this.myState.pawns[i].translateAndProject();
			}
			if(this.myState.invalidMoveCache && (isSelection === false)) {
				isSelection = this.myState.pawns[i].enable;
			}
			this.myState.pawns[i].draw(this.myState.ctx, isSelection);
		}

		//REMOVE
		/*for(var t = 0, l = this.myState.a3DBoard.cache[0].length; t < l; t++) {
			this.myState.ctx.beginPath();
			this.myState.ctx.arc(this.myState.a3DBoard.cache[0][t][0], this.myState.a3DBoard.cache[0][t][2], 10, 0, 2 * Math.PI, false);
			this.myState.ctx.lineWidth = 1;
			this.myState.ctx.strokeStyle = '#003300';
			this.myState.ctx.stroke();
			
			this.myState.ctx.font = 'italic bold 10px sans-serif';
			this.myState.ctx.fillText(t, this.myState.a3DBoard.cache[0][t][0], this.myState.a3DBoard.cache[0][t][2]);
		}
		
		var centerX = this.myState.width / 2;
		var centerY = this.myState.height / 2;
		var radius = 10;
		
		this.myState.ctx.beginPath();
		this.myState.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		this.myState.ctx.lineWidth = 1;
		this.myState.ctx.strokeStyle = '#003300';
		this.myState.ctx.stroke();*/
		//END
	    this.myState.recalculate = false;
		this.myState.valid = true;
	}
};

/**
 * Draw the background
 * @method drawBackGround
 */
GOBBLET.Game.prototype.drawBackGround = function() {
	var color,
		x = (this.myState.sliders[0].offsetX),
		y = (this.myState.cHeight - this.myState.sliders[0].sliderHeight),
		w = (this.myState.cWidth - this.myState.sliders[0].offsetX*2),
		h = (this.myState.sliders[0].sliderHeight - this.myState.sliders[0].offsetY);

	//background
	this.myState.ctx.globalAlpha = 0;
	this.myState.ctx.fillRect (0, 0, this.myState.cWidth, this.myState.cHeight);
	this.myState.ctx.globalAlpha = 1;

	//horizontal slider
	this.myState.ctx.beginPath();
	this.myState.ctx.moveTo(x, y);
	this.myState.ctx.lineTo(x + w, y);
	this.myState.ctx.arc(x + w, y + h / 2, h / 2, 1.5 * Math.PI, 0.5 * Math.PI, false);
    this.myState.ctx.lineTo(x, y + h);
    this.myState.ctx.arc(x, y + h / 2, h / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);	
	//this.myState.ctx.fillRect(x, y, w, h);
    this.myState.ctx.closePath();
    color = this.myState.ctx.createLinearGradient(0, 0, w, 0);
    color.addColorStop(this.myState.currentPlayer === 1 ? 1 : 0, "rgba(255,255,255, 0.6)");
    color.addColorStop("0.5", "rgba(210,210,210, 0.2)");
    color.addColorStop(this.myState.currentPlayer === 1 ? 0 : 1, "rgba(210,210,210, 0.2)");
	this.myState.ctx.fillStyle = color;
    this.myState.ctx.fill();
    
    //vertical slider
    x = (this.myState.cWidth - this.myState.sliders[0].sliderHeight);
	y = (this.myState.sliders[0].offsetX);
	w = (this.myState.sliders[0].sliderHeight - this.myState.sliders[0].offsetY);
	h = (this.myState.cHeight - this.myState.sliders[0].offsetX*2);
	this.myState.ctx.beginPath();
	this.myState.ctx.moveTo(x, y);
	this.myState.ctx.lineTo(x, y + h);
	this.myState.ctx.arc(x + w / 2, y + h, w / 2, Math.PI, 0, true);
    this.myState.ctx.lineTo(x + w, y);
    this.myState.ctx.arc(x + w / 2, y, w / 2, 0, Math.PI, true);
	//this.myState.ctx.fillRect(x, y, w, h);
    this.myState.ctx.closePath();
    this.myState.ctx.fillStyle = "rgba(210,210,210, 0.2)";
    this.myState.ctx.fill();
};

/**
 * Clear the canvas
 * @method clear
 */
GOBBLET.Game.prototype.clear = function() {
	this.myState.ctx.clearRect(0, 0, this.myState.cWidth, this.myState.cHeight);
};