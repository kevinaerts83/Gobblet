var GOBBLET = GOBBLET || {};
/**
 * AI class
 * @class AI
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.AI = function () {
	this.nextMove = -1;
	this.pawn = {};
	this.level = 0;
	this.tiles = [0, 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18];
	this.mask = [61440, 3840, 240, 15, 34952, 17476, 8738, 4369, 33825, 4680];
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
	this.visibleWhite = 0;
	this.visibleBlack = 0;
	this.visibleWhiteRows = [];
	this.visibleBlackRows = [];
	this.moving = false;
	this.rowsWith3BlackPawns = [];
	this.report = -1; //test framework
	this.crossings = 38505; //parseInt('1001011001101001', 2); tiles that occur in 3 masks
	this.randomMaskSequence = this.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); //don't loop in sequence else the moves are predictable
};

/**
* Calculate visible pawns
* @method cache
*/
GOBBLET.AI.prototype.cache = function (isWhite, bState) {
	var t, foo = bState[isWhite], bar = bState[2], temp = [];

	temp[0] = foo[0];
	temp[1] = (foo[1] ^ bar[0]) & foo[1];
	temp[2] = (foo[2] ^ (bar[0] | bar[1])) & foo[2];
	temp[3] = (foo[3] ^ (bar[0] | bar[1] | bar[2])) & foo[3];
	t = temp[0] | temp[1] | temp[2] | temp[3];

	if (isWhite) {
		this.visibleWhite = t;
		this.visibleWhiteRows[0] = temp[0];
		this.visibleWhiteRows[1] = temp[1];
		this.visibleWhiteRows[2] = temp[2];
		this.visibleWhiteRows[3] = temp[3];
	} else {
		this.visibleBlack = t;
		this.visibleBlackRows[0] = temp[0];
		this.visibleBlackRows[1] = temp[1];
		this.visibleBlackRows[2] = temp[2];
		this.visibleBlackRows[3] = temp[3];
	}
};

/**
* Property RowsWith3BlackPawns
* @method getRowsWith3BlackPawns
*/
GOBBLET.AI.prototype.getRowsWith3BlackPawns = function () {
	if (this.rowsWith3BlackPawns === undefined) {
		this.rowsWith3BlackPawns = this.rowCheck(false, 3, [], false);
	}
	return this.rowsWith3BlackPawns;
};

GOBBLET.AI.prototype.writeLog = function (bState) {
	var one = (65536 + bState[0][0]).toString(2).slice(1, 17), two = (65536 + bState[0][1]).toString(2).slice(1, 17), three = (65536 + bState[0][2]).toString(2).slice(1, 17), four = (65536 + bState[0][3]).toString(2).slice(1, 17);
	console.log('black');
	console.log(one.slice(0, 4) + ' ' + one.slice(4, 8) + ' ' + one.slice(8, 12) + ' ' + one.slice(12, 16));
	console.log(two.slice(0, 4) + ' ' + two.slice(4, 8) + ' ' + two.slice(8, 12) + ' ' + two.slice(12, 16));
	console.log(three.slice(0, 4) + ' ' + three.slice(4, 8) + ' ' + three.slice(8, 12) + ' ' + three.slice(12, 16));
	console.log(four.slice(0, 4) + ' ' + four.slice(4, 8) + ' ' + four.slice(8, 12) + ' ' + four.slice(12, 16));

	one = (65536 + bState[1][0]).toString(2).slice(1, 17);
	two = (65536 + bState[1][1]).toString(2).slice(1, 17);
	three = (65536 + bState[1][2]).toString(2).slice(1, 17);
	four = (65536 + bState[1][3]).toString(2).slice(1, 17);
	console.log('white');
	console.log(one.slice(0, 4) + ' ' + one.slice(4, 8) + ' ' + one.slice(8, 12) + ' ' + one.slice(12, 16));
	console.log(two.slice(0, 4) + ' ' + two.slice(4, 8) + ' ' + two.slice(8, 12) + ' ' + two.slice(12, 16));
	console.log(three.slice(0, 4) + ' ' + three.slice(4, 8) + ' ' + three.slice(8, 12) + ' ' + three.slice(12, 16));
	console.log(four.slice(0, 4) + ' ' + four.slice(4, 8) + ' ' + four.slice(8, 12) + ' ' + four.slice(12, 16));
};
/**
* Calculate next move
* @method move
*/
GOBBLET.AI.prototype.move = function (bState, pawns) {
	if (this.moving === false) {
		this.moving = true;// make threat save

		delete this.rowsWith3BlackPawns;
		this.cache(0, bState);
		this.cache(1, bState);

		this.report = 0;
		//this.writeLog(bState);
		if (this.tryToWin(bState, pawns)) {
			this.report = 1;
			if (this.dontLose(bState, pawns)) {
				this.report = 2;
				if (this.block(bState, pawns)) {
					this.report = 3;
					this.attack(bState, pawns);
				}
			}
		}
		//fallback
		if ((this.pawn === undefined) || (this.pawn.tile === undefined) || (this.tiles.indexOf(this.nextMove) === -1)) {
			this.writeLog(bState);
			this.randomMove(pawns);
			console.log('current tile: ' + this.pawn.tile + ', next tile: ' + this.nextMove);
		}
		//console.log('current tile: ' + this.pawn.tile + ', next tile: ' + this.nextMove);
		this.moving = false;
	}
};

/**
* Try To Win
* @method tryToWin
*/
GOBBLET.AI.prototype.tryToWin = function (bState, pawns) {
	var i, l, blackSize, maskToCheck, rows = this.rowCheck(true, 3, bState, true); //Get all white rows with 3 on a row without black size 0

	for (i = 0, l = rows.length; i < l; i += 1) {
		maskToCheck = this.mask[rows[i]];
		//the tile to attack
		this.nextMove = this.getNextMove(maskToCheck, this.visibleWhite, true);
		//check if the tile is empty
		if ((this.visibleBlack & maskToCheck) !== 0) {
			blackSize = this.getPawnSize(this.nextMove, pawns);
			if (blackSize > 0 && blackSize < 4) {
				return this.setNextPawn(pawns, blackSize, rows, bState);
			}
		} else {
			return this.setNextPawn(pawns, 4, rows, bState);
		}
	}
	return true;
};

/**
* Don't lose
* @method dontLose
*/
GOBBLET.AI.prototype.dontLose = function (bState, pawns) {
	var i, l, s, maskCrossing, maskToCheck, 
		rows = this.rowCheck(false, 3, bState, true); //Get all black rows with 3 on a row without white size 0

	if (rows.length > 1) {
		maskCrossing = this.mask[rows[0]];
		for (i = 1, l = rows.length; i < l; i += 1) {
			maskCrossing &= this.mask[rows[i]];
		}
		if (maskCrossing > 0) {
			//check if the opponent has a size 0 on the row
			//if ((bState[1][0] & maskCrossing) === 0) {
			this.nextMove = this.getNextMove(0, maskCrossing, false);
			//Check if size 0 not already on crossing
			if (this.getPawnSize(this.nextMove, pawns) !== 0) {
				//get size 0 to put on crossing
				if (this.setNextPawn(pawns, 1, rows, bState) === false) {
					return false;
				}
			}
			//}
		}
	} else if (rows.length === 1) {
		maskToCheck = this.mask[rows[0]];
		//check if there is not already a size 0 on the row
		//if ((bState[1][0] & maskToCheck) === 0) {
		s = this.getSmallestBlackPawnOfRow(this.mask[rows[0]]);
		//the tile to attack
		this.nextMove = this.getNextMove(maskToCheck, this.visibleBlackRows[s], false);
		// Try to put pawn over opponent
		if (this.setNextPawn(pawns, s, rows, bState) === false) {
			return false;
		}

		// Try to put a size = 0 on empty cell
		//the tile to attack
		this.nextMove = this.getNextMove(maskToCheck, this.visibleBlack, true);
		// Try to put pawn on empty tile
		if (this.setNextPawn(pawns, 1, rows, bState) === false) {
			return false;
		}
		//}
	}
	//go to attack
	return true;
};

/**
* Block
* @method block
*/
GOBBLET.AI.prototype.block = function (bState, pawns) {
	//if level is 1: check if black player can put a size0 on a tile creating 2 row with 3 pawns. (no biggest white pawns on the rows)
	//fake a black pawn size1 on that tile and do don't loose
	if (this.level === 1) {
		var i, l, oldValue, old2, old3, ret = true, 
			masks = [63624, 62532, 61986, 61713, 36744, 20292, 12066, 7953, 35064, 17652, 8946, 4593, 34959, 17487, 8751, 4383, 62497, 36641, 34033, 33839, 62024, 8008, 4856, 4687, 36009, 50277, 42531, 38193, 39624, 22092, 12906, 4953],
			crossing = [32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 32768, 1024, 32, 1, 4096, 512, 64, 8, 32768, 1024, 32, 1, 8, 64, 512, 4096];
		for (i = 0, l = masks.length; i < l; i += 1) {
			if ((this.count1Bits(this.visibleBlack & masks[i]) > 3) && ((this.visibleBlack & crossing[i]) === 0) && ((bState[1][0] & masks[i]) === 0)) {
				oldValue = bState[0][1];
				old2 = this.visibleBlack;
				old3 = this.visibleBlackRows[1];
				
				bState[0][1] |= crossing[i];
				this.visibleBlack |= crossing[i];
				this.visibleBlackRows[1] |= crossing[i];

				ret = this.dontLose(bState, pawns);
				
				bState[0][1] = oldValue;
				this.visibleBlack = old2;
				this.visibleBlackRows[1] = old3;
				break;
			}
		}
		return ret;
	}
	return true;
};

/**
* Attack
* @method attack
*/
GOBBLET.AI.prototype.attack = function (bState, pawns) {
	var s = 0, i, rowToAttack, wRows = [];
	
	if (this.visibleWhite !== 0) {
		//determine whites best row lower is better
		wRows = this.sortWhiteRows(bState);
	} 
	for (i = 0; i < 10; i += 1) {
		rowToAttack = (wRows.length > i)  ? (wRows[i].rowNumber) : undefined;
		//set the nextMove
		this.chooseTileFromRowToAttack(bState, rowToAttack);
		
		if (this.nextMove >= 0) {
			s = this.getPawnSize(this.nextMove, pawns);
			s = (s === -1 ? 4 : s);
			if (this.setNextPawn(pawns, s, this.getRowsOfTile(this.nextMove), bState) === false) {
				break;
			}
		}
		if (wRows.length < i) {
			break;
		}
	}
	
	if (this.nextMove < 0) {
		this.attackFallBack(bState, pawns);
	}
};
/**
* Attack fall back
* @method attackFallBack
*/
GOBBLET.AI.prototype.attackFallBack = function (bState, pawns) {
	var i, size, ignore = 0;
	for (i = 0; i < 4; i += 1) {
		size = this.getPawnSize(this.nextMove, pawns);
		size = (size === -1 ? 4 : size);
		if (this.setNextPawn(pawns, size, this.getRowsOfTile(this.nextMove), bState)) {
			//setNextPawn returns true if no pawn was found.
			this.nextMove = this.startAttack(bState, ignore);
			ignore += Math.pow(2, this.tiles.indexOf(this.nextMove));
		} else {
			break;
		}
	}
};
/**
* Choose a tile to attack
* @method startAttack
*/
GOBBLET.AI.prototype.startAttack = function (bState, ignore) {
	var c = (this.crossings ^ bState[0][0] ^ bState[1][0] ^ ignore).toString(2), rnd = c.length, t;
	rnd = Math.floor(Math.random() * rnd);
	t = c.indexOf('1', rnd);
	while (t === -1) {
		rnd = Math.floor(Math.random() * rnd);
		t = c.indexOf('1', rnd);
	}
	return this.tiles[15 - t];//15=tiles.length - 1
};

/**
* get Next Move
* @method getNextMove
*/
GOBBLET.AI.prototype.getNextMove = function (mask, state, reverse) {
	var result = 0;
	if (mask === 0) {
		result = state;
	} else {
		result = (mask & state);
		if (reverse) {
			result ^= mask;
		}
	}
	return this.tiles[result.toString(2).length - 1];
};

/**
* set Next Pawn
* @method setNextPawn
*/
GOBBLET.AI.prototype.setNextPawn = function (pawns, size, rows, bState) {
	var ret = true, solution = this.getPawnFromStack(pawns, size);
	if (solution) {
		this.pawn = solution;
		ret = false;
	} else {
		solution = this.getPawnFromBoard(pawns, size, rows, bState);
		if (solution) {
			this.pawn = solution;
			ret = false;
		}
	}
	return ret;
};

/**
* random Move (fallback)
* @method randomMove
*/
GOBBLET.AI.prototype.randomMove = function (pawns) {
	var i, s = 0, t, p;
	while (s === 0) {
		t = Math.floor(Math.random() * 16);
		this.nextMove = this.tiles[t];
		s = this.getPawnSize(this.nextMove, pawns);
	}
	for (i = pawns.length - 1; i >= 0; i -= 1) {
		p = pawns[i];
		if ((p.isTurn === 1) && p.visible && (p.tile !== this.nextMove) && (p.size < s || s === 4)) {
			this.pawn = pawns[i];
			break;
		}
	}
};

/**
 * Shuffle the values of an array around;
 */
GOBBLET.AI.prototype.shuffle = function (o) {
	var j, x, i;
	for (i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i]) {
		o[i] = o[j];
		o[j] = x;
	}
	return o;
};

/**
* Get rows of tile 
* @method getRowsOfTile
*/
GOBBLET.AI.prototype.getRowsOfTile = function (tile) {
	var i, rows = [], tileNr = Math.pow(2, this.tiles.indexOf(tile));
	for (i = 0; i < 10; i += 1) {
		if ((this.mask[i] & tileNr) !== 0) {
			rows.push(i);
		}
	}
	return rows;
};

/**
* Get Pawn From Stack
* @method getPawnFromStack
*/
GOBBLET.AI.prototype.getPawnFromStack = function (pawns, size) {
	var i, p, r;
	for (i = pawns.length - 1; i >= 0; i -= 1) {
		p = pawns[i];
		if ((p.isTurn === 1) && p.visible && (p.onTheBoard === false) && (p.size < size)) {
			if (r === undefined || (p.size > r.size)) {
				r = p;
			}
		}
	}
	return r;
};

/**
* Get Pawn From Board
* There no black pawn beneath it
* @method getPawnFromBoard
* @param excludeRows: the rows that are being checked must be excluded
*/
GOBBLET.AI.prototype.getPawnFromBoard = function (pawns, size, excludeRows, bState) {
	var i, l, j, r, g, p, theTile, binairTile, graded;
	if (this.level === 0) {
		for (i = 0, l = pawns.length; (i < l) && (r === undefined); i += 1) {
			p = pawns[i];
			if ((p.isTurn === 1) && p.visible && (p.onTheBoard === true) && (p.size < size)) {
				binairTile = Math.pow(2, this.tiles.indexOf(p.tile));
				for (j = 0; j < this.mask.length; j += 1) {
					if ((this.mask[j] & binairTile) === binairTile) {
						if ((this.getRowsWith3BlackPawns().indexOf(j) === -1) && (excludeRows.indexOf(j) === -1)) {
							r = p;
						} else {
							r = undefined;
							break;
						}
					}
				}
			}
		}
	} else {
		j = 0;
		for (i = size - 1; i > -1; i -= 1) {
			graded = this.getUnimportantWhiteTile(i, excludeRows, bState);
			for (g = 0, l = graded.length; g < l; g += 1) {
				if ((j === 0) || (j > graded[g].grade)) {
					j = graded[g].grade;
					theTile = graded[g].id;
				}
			}
		}
		if (theTile !== undefined) {
			for (i = 0, l = pawns.length; i < l; i += 1) {
				p = pawns[i];
				if ((p.tile === theTile) && (p.isTurn === 1) && p.visible) {
					r = p;
					break;
				}
			}
		}
	}
	return r;
};

/**
* get unimportant White Tile
* @method getUnimportantWhiteTile
*/
GOBBLET.AI.prototype.getUnimportantWhiteTile = function (size, excludeRows, bState) {
	var i, j, l, lj, o, n, r, p, bad, aTile, cache = [], result = [], tileRows, wTiles = this.getTilesOfSize(size); //get the tile of a visible white pawns from a certain size

	for (i = 0, l = wTiles.length; i < l; i += 1) {
		bad = false;
		aTile = wTiles[i];
		//tileRows contains the row indexes, these indexes are the same as the mask indexes for those rows
		tileRows = this.getRowsOfTile(aTile);
		//loop over every row of the tile (max 3)
		//a white pawn is only unimportant if it's not blocking a row or not of strategic interest for a row
		for (j = 0, lj = tileRows.length; j < lj; j += 1) {
			r = tileRows[j];
			p = Math.pow(2, this.tiles.indexOf(aTile));
			//stop processing the tile if it's in a row with 3 black pawns, or the row that is currently formed.
			if ((this.getRowsWith3BlackPawns().indexOf(r) !== -1) || (excludeRows.indexOf(r) !== -1)) {
				bad = true;
				break;
			} else if ((this.count1Bits(this.mask[r] & this.visibleBlack) === 2) && 
					((((this.mask[r] & bState[1][0]) | p) ^ p) === 0) && 
					(this.getColorUnderneath(aTile, size, bState) === 2)) {
				//Stop when all conditions are true
				// - 2 black pawn
				// - no biggest white pawn (except the one being checked)
				// - and one black pawn underneath (the one being checked)
				bad = true;
				break;
			} else {
				//Set cache for Grade
				//Count for every row the tile is in, the white and black pawns.
				o = this.getObjectFromArray(cache, aTile);//id === tile
				if (o) {
					o.countWhite += this.count1Bits((this.visibleWhite & this.mask[r]));
					o.countBlack += this.count1Bits((this.visibleBlack & this.mask[r]));
				} else {
					cache.push({id: aTile,
						countWhite: this.count1Bits((this.visibleWhite & this.mask[r])),
						countBlack: this.count1Bits((this.visibleBlack & this.mask[r]))});
				}
			}
		}
		if (bad === false) {
			//initialize result array for tiles that passed the test.
			result.push({id: aTile, grade: 0});
		}
	}
	//GRADE
	for (i = 0; i < result.length; i += 1) {
		o = this.getObjectFromArray(cache, result[i].id);//id === tile
		n = this.getColorUnderneath(o.id, size, bState);
		/* *** the best pawn we do not want to move ***
		 * larger pawn 
		 * 1 or 2 white pawns in a row 
		 * 1, 2, 3 black pawns in a row
		 * a black pawn underneath
		 * a white pawn underneath is not the best situation
		 * */
		result[i].grade = ((4 - size) * 2) + o.countWhite + (o.countBlack * 2) + ((n === 0) ? 0 : (n === 1) ? -2 : 5);
	}
	return result;
};

/**
* get Object From Array
* @method getObjectFromArray
*/
GOBBLET.AI.prototype.getObjectFromArray = function (objects, value) {
	var ret, o, l;
	for (o = 0, l = objects.length; o < l; o += 1) {
		if (objects[o].id === value) {
			ret = objects[o];
			break;
		}
	}
	return ret;
};
/**
* get Color Underneath
* @method getColorUnderneath
* @return int: 0 = nothing; 1 = white; 2 = black;
*/
GOBBLET.AI.prototype.getColorUnderneath = function (tile, size, bState) {
	var i, number = Math.pow(2, this.tiles.indexOf(tile)), ret = 0;
	for (i = size + 1; (i < 4) && (ret === 0); i += 1) {
		if ((bState[1][i] & number) !== 0) {
			ret = 1;
		}
		if ((bState[0][i] & number) !== 0) {
			ret = 2;
		}
	}
	return ret;
};

/**
* get Tiles Of Size
* @method getTilesOfSize
*/
GOBBLET.AI.prototype.getTilesOfSize = function (size) {
	if (size <= 3) {
		var wTiles = [], 
			b = this.visibleWhiteRows[size].toString(2), 
			l = b.length - 1,
			start = b.indexOf('1');
	
		while (start > -1) {
			wTiles.push(this.tiles[l - start]);
			start = b.indexOf('1', start + 1);
		}
		
		return wTiles;
	}
	return [];
};
/**
* Get size pawn on tile
* @method getPawnSize
*/
GOBBLET.AI.prototype.getPawnSize = function (tile, pawns) {
	var i, p, r = 4;
	for (i = pawns.length - 1; i >= 0; i -= 1) {
		p = pawns[i];
		if (p.visible && (p.tile === tile)) {
			r = p.size;
			break;
		}
	}
	return r;
};
/**
 * Determine whites best row lower is better
 * @method sortWhiteRows
 */
//
GOBBLET.AI.prototype.sortWhiteRows = function (bState) {
	var i, j, visibleWhiteOnRow, aMask, countRow, whiteBestRows = [];
	//var lowest = 21;
	for (i = 0; i < 10; i += 1) {
		j = this.randomMaskSequence[i];//shuffled numbers from 0 to 10
		aMask = this.mask[j];
		visibleWhiteOnRow = this.visibleWhite & aMask;
		//count the biggest black pawns and white pawns on the row if equal to four the row can't be attacked
		if (this.count1Bits(visibleWhiteOnRow ^ (aMask & bState[0][0])) !== 4) {
			countRow = (4 - this.count1Bits(visibleWhiteOnRow)) * 5; //number of tiles on row not occupied by white * 5
			countRow += (this.count1Bits(this.visibleWhiteRows[3] & aMask)) * 4;//tiles occupied by smallest white * 4
			countRow += (this.count1Bits(this.visibleWhiteRows[2] & aMask)) * 3;
			countRow += (this.count1Bits(this.visibleWhiteRows[1] & aMask)) * 2;
			countRow += (this.count1Bits(this.visibleWhiteRows[0] & aMask));
			countRow -= this.count1Bits((aMask & (this.visibleWhite | this.visibleBlack)) ^ aMask); //empty tiles
			
			/*//find lowest countRow with the smallest black pawn different from the biggest
			if ((countRow < lowest) && (this.getSmallestBlackPawnOfRow(aMask) !== 0)) {
				rowToAttack = j;
				lowest = countRow;
			}*/
			whiteBestRows.push({rowCount: countRow, rowNumber: j});
		}
	}
	whiteBestRows.sort(function (a, b) { return a.rowCount - b.rowCount; });
	return whiteBestRows;
};
/**
 * Pick a tile from a given row to attack
 * @method choose Tile From Row To Attack
 */
//
GOBBLET.AI.prototype.chooseTileFromRowToAttack = function (bState, rowToAttack) {
	var rowMask, emptyTiles, s;
	if (rowToAttack === undefined) {
		//do random move
		this.nextMove = this.startAttack(bState, 0);
	} else {
		rowMask = this.mask[rowToAttack];
		emptyTiles = (rowMask & (this.visibleWhite | this.visibleBlack)) ^ rowMask;
		if (emptyTiles === 0) {
			s = this.getSmallestBlackPawnOfRow(rowMask);
			//emptyTiles = array of tiles with the smallest black pawns
			emptyTiles = bState[0][s];
			for (s -= 1; s > -1; s -= 1) {
				emptyTiles = (emptyTiles ^ (bState[0][s] | bState[1][s])) & emptyTiles;
			}
		}
		this.nextMove = this.getNextMove(rowMask, emptyTiles, false);
	}
};

/**
 * Check number of 1 in a row for a certain player
 * @method rowCheck
 */
GOBBLET.AI.prototype.rowCheck = function (checkWin, maxCount, bState, removeRowsWithSize0) {
	var i, l, color = (checkWin ? 0 : 1), rows = [], number = (checkWin ? this.visibleWhite : this.visibleBlack);
	for (i = 0, l = this.mask.length; i < l; i += 1) {
		if (this.count1Bits(this.mask[i] & number) === maxCount) {
			if (removeRowsWithSize0) {
				if ((bState[color][0] & this.mask[i]) === 0) {
					rows.push(i);
				}
			} else {
				rows.push(i);
			}
		}
	}
	return rows;
};

/**
 * Smallest visible pawn of black in that row
 * @method getSmallestBlackPawnOfRow
 */
GOBBLET.AI.prototype.getSmallestBlackPawnOfRow = function (mask) {
	var i, s = 4;	
	for (i = 3; i > -1; i -= 1) {
		if ((mask & this.visibleBlackRows[i]) !== 0) {
			s = i;
			break;
		}
	}
	return s;
};

/**
 * Wegner: This algorithm is better when most bits in x are 0 
 * @method count1Bits
 */
GOBBLET.AI.prototype.count1Bits = function (x) {
    var count;
    for (count = 0; x; count += 1) {
        x &= x - 1;
    }
    return count;
};