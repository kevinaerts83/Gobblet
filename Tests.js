var GOBBLET = GOBBLET || {};

/**
 * Test class
 * @class Test
 * @constructor
 * @namespace GOBBLET
 */
GOBBLET.Test = function(level, test) {
	var ai = new GOBBLET.AI();
	ai.level = (level === undefined ? 0 : level); //1=hard
	
	var bState = [];
	var pawns = [];
	bState[0] = [];
	bState[1] = [];
	bState[2] = [];
	if((test === 0) || test < 5) {
		/***       *******************************************       ***
		*						TRY TO WIN
		****       *******************************************       ***/
		//3 on a row, no black pawn and pawn in stack
		
		bState[0][0] = parseInt('0000000000000000', 2);
		bState[0][1] = parseInt('0000000000000000', 2);
		bState[0][2] = parseInt('0000000000000000', 2);
		bState[0][3] = parseInt('0000000000000000', 2);
		
		bState[1][0] = parseInt('1000000000000000', 2);
		bState[1][1] = parseInt('0000100000000000', 2);
		bState[1][2] = parseInt('0000000010000000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		
		bState[2][0] = bState[0][0] | bState[1][0];
		bState[2][1] = bState[0][1] | bState[1][1];
		bState[2][2] = bState[0][2] | bState[1][2];
		bState[2][3] = bState[0][3] | bState[1][3];
		
		pawns[0] = getPawn(999, 3, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('try to win 1:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 3)));
	}
	/***       *******************************************       ***/
	if((test === 0) || test < 5) {
		//3 on a row, black pawn blocks with size 0
		bState[0][0] = parseInt('0000000000001000', 2);
		bState[2][0] = bState[0][0] | bState[1][0];
		delete ai.pawn;
		ai.move(bState, pawns);
		console.log('try to win 2:' + (ai.report > 0).toString());
	}
	/***       *******************************************       ***/
	if((test === 0) || test < 5) {
		//3 on a row, black pawn blocks with size 2, but size 0 in stack
		bState[0][0] = parseInt('0000000000000000', 2);
		bState[0][2] = parseInt('0000000000001000', 2);
		bState[2][0] = bState[0][0] | bState[1][0];
		bState[2][2] = bState[0][2] | bState[1][2];
		pawns[0] = getPawn(0, 3, 1, -1, 1);
		pawns[1] = getPawn(999, 1, 1, -1, 1);
		pawns[2] = getPawn(0, 2, 1, -1, 1);
		pawns[3] = getPawn(0, 2, 0, 3, 1);
		delete ai.pawn;
		ai.move(bState, pawns);
		console.log('try to win 3:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 3)));
	}
	/***       *******************************************       ***/
	if((test === 0) || test < 5) {
		//3 on a row, black pawn blocks with size 2, and nothing in stack
		bState[0][0] = parseInt('0000000000100000', 2);
		bState[0][1] = parseInt('0000001000000000', 2);
		bState[0][2] = parseInt('0010000000001000', 2);
		bState[0][3] = parseInt('0000000000000010', 2);
		bState[1][0] = parseInt('1010000000000000', 2);
		bState[1][1] = parseInt('0000100100000000', 2);
		bState[2][0] = bState[0][0] | bState[1][0];
		bState[2][1] = bState[0][1] | bState[1][1];
		bState[2][2] = bState[0][2] | bState[1][2];
		bState[2][3] = bState[0][3] | bState[1][3];
		
		pawns = [];
		pawns[0] = getPawn(999, 1, 1, 10, 1);
		pawns[1] = getPawn(0, 0, 1, 18, 1);
		pawns[2] = getPawn(0, 1, 1, 13, 1);
		pawns[3] = getPawn(0, 2, 1, 8, 1);
		pawns[4] = getPawn(0, 0, 1, 16, 1);
		
		pawns[5] = getPawn(0, 2, 0, 3, 1);
		pawns[6] = getPawn(0, 0, 0, 6, 1);
		pawns[7] = getPawn(0, 1, 0, 11, 1);
		pawns[8] = getPawn(0, 2, 0, 16, 1);
		pawns[9] = getPawn(0, 3, 0, 1, 1);
		
		delete ai.pawn;
		ai.move(bState, pawns);
		//ai.getPawnFromBoard(pawns, 2, [4], [[32, 512, 8200, 2], [40960, 2304, 128, 0], [40992, 2816, 8328, 2]]);
		console.log('try to win 4:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 3)));
		
	}
	/***       *******************************************       ***/
	
	/***       *******************************************       ***
	 *						DONT LOSE
	 ****       *******************************************       ***/
	if((test === 0) || test === 5) {
		//3 on a row, block from stack
		bState = [];
		bState[0] = [];
		bState[0][0] = parseInt('0111000000000000', 2);
		bState[0][1] = parseInt('0000100000000000', 2);
		bState[0][2] = parseInt('0000000010000000', 2);
		bState[0][3] = parseInt('0000000000001000', 2);
		bState[1] = [];
		bState[1][0] = parseInt('0000000000000010', 2);
		bState[1][1] = parseInt('0000000000000000', 2);
		bState[1][2] = parseInt('0000000000000000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		bState[2] = [];
		bState[2][0] = bState[0][0] | bState[1][0];
		bState[2][1] = bState[0][1] | bState[1][1];
		bState[2][2] = bState[0][2] | bState[1][2];
		bState[2][3] = bState[0][3] | bState[1][3];
		pawns = [];
		pawns[0] = getPawn(999, 0, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('dont lose 1:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 18)));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 6) {
		//3 on a row, block from board
		pawns = [];
		pawns[0] = getPawn(999, 0, 1, 1, 1);
		ai.move(bState, pawns);
		console.log('dont lose 2:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 18)));
		
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 7) {
		//3 on a row, block from stack
		bState[0][0] = parseInt('0000000000000000', 2);
		bState[2][0] = bState[0][0] | bState[1][0];
		pawns = [];
		pawns[0] = getPawn(0, 0, 1, -1, 1);
		pawns[1] = getPawn(999, 2, 1, -1, 1);
		pawns[2] = getPawn(0, 0, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('dont lose 3:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 3)));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 8) {
		//3 on a row, block from stack
		bState[0][0] = parseInt('1110000000000000', 2);
		bState[0][3] = parseInt('0000000000000000', 2);
		bState[1][0] = parseInt('0001000000000010', 2);
		bState[2][0] = bState[0][0] | bState[1][0];
		bState[2][3] = bState[0][3] | bState[1][3];
		pawns = [];
		pawns[0] = getPawn(999, 0, 1, -1, 1);
		pawns[1] = getPawn(0, 0, 0, 18, 1);
		ai.move(bState, pawns);
		console.log('dont lose 4:' + (ai.pawn && ai.nextMove && (ai.pawn.depth === 999) && (ai.nextMove === 8)));
	}
	/***       *******************************************       ***/
	
	/***       *******************************************       ***
	*						Attack
	****       *******************************************       ***/
	if((test === 0) || test === 9) {
		//Get Color Underneath
		bState = [];
		bState[0] = [];
		bState[0][0] = parseInt('0000000000000000', 2);
		bState[0][1] = parseInt('0000000000000000', 2);
		bState[0][2] = parseInt('0000000000000000', 2);
		bState[0][3] = parseInt('0000000000000000', 2);
		bState[1] = [];
		bState[1][0] = parseInt('1100010000000000', 2);
		bState[1][1] = parseInt('0000000000000000', 2);
		bState[1][2] = parseInt('0000000000000000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		pawns = [];
		pawns[0] = getPawn(18, 0, 1, 18, 1);
		pawns[1] = getPawn(17, 0, 1, 17, 1);
		pawns[2] = getPawn(12, 0, 1, 12, 1);
		ai.move(bState, pawns);
		console.log('attack:' + (ai.pawn && ai.nextMove && 
				(ai.pawn.depth === 12 && (ai.nextMove === 16 || ai.nextMove === 15)) || 
				(ai.pawn.depth === 17 && (ai.nextMove === 6 || ai.nextMove === 0)) || 
				(ai.pawn.depth === 18 && (ai.nextMove === 7 || ai.nextMove === 2))));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 10) {
		//2 random
		bState[0][0] = parseInt('1000000001100000', 2);
		bState[0][1] = parseInt('0001000001000000', 2);
		bState[0][2] = parseInt('0000000000000100', 2);
		bState[0][3] = parseInt('0000000010000000', 2);
	
		bState[1][0] = parseInt('0000001000001100', 2);
		bState[1][1] = parseInt('1010000000000000', 2);
		bState[1][2] = parseInt('0001000010000000', 2);
		bState[1][3] = parseInt('0000000001000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 18, 1);
		pawns[1] = getPawn(1, 0, 0, 6, 1);
		pawns[2] = getPawn(2, 0, 0, 7, 1);
		pawns[3] = getPawn(3, 1, 0, 15, 1);
		pawns[4] = getPawn(4, 1, 0, 7, 0);
		pawns[5] = getPawn(5, 2, 0, 2, 0);
		pawns[6] = getPawn(6, 3, 0, 8, 0);
		
		//white
		pawns[7] = getPawn(7, 0, 1, 3, 1);
		pawns[8] = getPawn(8, 0, 1, 2, 1);
		pawns[9] = getPawn(9, 0, 1, 11, 1);
		pawns[10] = getPawn(10, 1, 1, 18, 0);
		pawns[11] = getPawn(11, 1, 1, 16, 1);
		pawns[12] = getPawn(12, 2, 1, 15, 0);
		pawns[13] = getPawn(13, 2, 1, 8, 1);
		pawns[14] = getPawn(14, 3, 1, 7, 0);
		
		ai.move(bState, pawns);
		console.log('attack 2:' + (ai.pawn && ai.nextMove && 
				((ai.pawn.depth === 8 && ai.nextMove === 15) || 
				 (ai.pawn.depth === 13 && ai.nextMove === 1))));	
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 11) {
		//3 random
		bState[0][0] = parseInt('0010110000000000', 2);
		bState[0][1] = parseInt('0100000000100010', 2);
		bState[0][2] = parseInt('0010001000000100', 2);
		bState[0][3] = parseInt('0000000001000000', 2);
	
		bState[1][0] = parseInt('1001000000100000', 2);
		bState[1][1] = parseInt('0010010000000100', 2);
		bState[1][2] = parseInt('0000000100100000', 2);
		bState[1][3] = parseInt('0100000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(16, 0, 0, 16, 1);
		pawns[1] = getPawn(13, 0, 0, 13, 1);
		pawns[2] = getPawn(12, 0, 0, 12, 1);
		pawns[3] = getPawn(17, 1, 0, 17, 1);
		pawns[4] = getPawn(999, 1, 0, 6, 0);
		pawns[5] = getPawn(1, 1, 0, 1, 1);
		pawns[6] = getPawn(999, 2, 0, 16, 0);
		pawns[7] = getPawn(11, 2, 0, 11, 1);
		pawns[8] = getPawn(999, 2, 0, 2, 0);
		pawns[9] = getPawn(7, 3, 0, 7, 1);
		//white
		pawns[10] = getPawn(18, 0, 1, 18, 1);
		pawns[11] = getPawn(15, 0, 1, 15, 1);
		pawns[12] = getPawn(6, 0, 1, 6, 1);
		pawns[13] = getPawn(999, 1, 1, 16, 0);
		pawns[14] = getPawn(999, 1, 1, 12, 0);
		pawns[15] = getPawn(2, 1, 1, 2, 1);
		pawns[16] = getPawn(10, 2, 1, 10, 1);
		pawns[17] = getPawn(999, 2, 1, 6, 0);
		pawns[18] = getPawn(999, 3, 1, 17, 0);
		
		ai.move(bState, pawns);
		console.log('attack 3:' + (ai.pawn && (ai.nextMove >= 0) ||
				(ai.pawn.depth === 15 && ai.nextMove === 15) ||
				(ai.pawn.depth === 2 && ai.nextMove === 11) || 
				(ai.pawn.depth === 6 && ai.nextMove === 17) || 
				(ai.pawn.depth === 10 && (ai.nextMove === 0 || ai.nextMove === 5))));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 12) {
		//4 random
		bState[0][0] = parseInt('0010110000000000', 2);
		bState[0][1] = parseInt('0001001100000000', 2);
		bState[0][2] = parseInt('0100000000100010', 2);
		bState[0][3] = parseInt('0000000011000100', 2);
		
		bState[1][0] = parseInt('0100001100000000', 2);
		bState[1][1] = parseInt('0000100000100010', 2);
		bState[1][2] = parseInt('1001000000000000', 2);
		bState[1][3] = parseInt('0100000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(16, 0, 0, 16, 1);
		pawns[1] = getPawn(13, 0, 0, 13, 1);
		pawns[2] = getPawn(12, 0, 0, 12, 1);
		pawns[3] = getPawn(15, 1, 0, 15, 1);
		pawns[4] = getPawn(999, 1, 0, 11, 0);
		pawns[5] = getPawn(999, 1, 0, 10, 0);
		pawns[6] = getPawn(999, 2, 0, 17, 0);
		pawns[7] = getPawn(999, 2, 0, 6, 0);
		pawns[8] = getPawn(999, 2, 0, 1, 0);
		pawns[9] = getPawn(8, 3, 0, 8, 1);
		pawns[10] = getPawn(7, 3, 0, 7, 1);
		pawns[11] = getPawn(2, 3, 0, 2, 1);
		//white
		pawns[12] = getPawn(17, 0, 1, 17, 1);
		pawns[13] = getPawn(11, 0, 1, 11, 1);
		pawns[14] = getPawn(10, 0, 1, 10, 1);
		pawns[15] = getPawn(999, 1, 1, 13, 0);
		pawns[16] = getPawn(6, 1, 1, 6, 1);
		pawns[17] = getPawn(1, 1, 1, 1, 1);
		pawns[18] = getPawn(18, 2, 1, 18, 1);
		pawns[19] = getPawn(999, 2, 1, 15, 0);
		pawns[20] = getPawn(999, 3, 1, 17, 0);
		
		ai.move(bState, pawns);
		console.log('attack 4:' + (ai.pawn.depth < 999 && ai.nextMove !== 15));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 13) {
		//5 random (black wins on row 1 and 6; 
		//best move is tile 15 with a black pawn size 1 on it.
		//tile 15 is in row 0,7,9 on which all big white pawns are
		bState[0][0] = parseInt('0000011000100000', 2);
		bState[0][1] = parseInt('0001000100000000', 2);
		bState[0][2] = parseInt('0010000000000000', 2);
		bState[0][3] = parseInt('0000000000000000', 2);
		                                         
		bState[1][0] = parseInt('0000000001001001', 2);
		bState[1][1] = parseInt('0000000010000001', 2);
		bState[1][2] = parseInt('0001000000000000', 2);
		bState[1][3] = parseInt('0000001000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(12, 0, 0, 12, 1);
		pawns[1] = getPawn(11, 0, 0, 11, 1);
		pawns[2] = getPawn(6, 0, 0, 6, 1);
		pawns[3] = getPawn(15, 1, 0, 15, 1);
		pawns[4] = getPawn(10, 1, 0, 10, 1);
		pawns[5] = getPawn(16, 2, 0, 16, 1);
		//white
		pawns[6] = getPawn(7, 0, 1, 7, 1);
		pawns[7] = getPawn(3, 0, 1, 3, 1);
		pawns[8] = getPawn(0, 0, 1, 0, 1);
		pawns[9] = getPawn(8, 1, 1, 8, 1);
		pawns[10] = getPawn(999, 1, 1, 0, 0);
		pawns[11] = getPawn(999, 2, 1, 15, 0);
		pawns[12] = getPawn(999, 3, 1, 11, 0);
		//stack
		pawns[13] = getPawn(888, 1, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('attack 5:' + (ai.pawn.depth === 888 && ai.nextMove === 18));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 14) {
		//6 random (For some reason the occupied tile 18 is chosen)
		//8765 3210 8765 3210
		bState[0][0] = parseInt('1000001001000000', 2);
		bState[0][1] = parseInt('1100000000000000', 2);
		bState[0][2] = parseInt('0000100000000000', 2);
		bState[0][3] = parseInt('0000000000000000', 2);
		                                               
		bState[1][0] = parseInt('0000000000110001', 2);
		bState[1][1] = parseInt('0000000010000100', 2);
		bState[1][2] = parseInt('1000000000000000', 2);
		bState[1][3] = parseInt('0000010000000000', 2);
		
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 18, 1);
		pawns[1] = getPawn(1, 0, 0, 11, 1);
		pawns[2] = getPawn(2, 0, 0, 7, 1);
		pawns[3] = getPawn(3, 1, 0, 18, 0);
		pawns[4] = getPawn(4, 1, 0, 17, 1);
		pawns[5] = getPawn(5, 2, 0, 13, 1);
		//white
		pawns[6] = getPawn(6, 0, 1, 5, 1);//moved to 18
		pawns[7] = getPawn(7, 0, 1, 6, 1);
		pawns[8] = getPawn(8, 0, 1, 0, 1);
		pawns[9] = getPawn(9, 1, 1, 8, 1);
		pawns[10] = getPawn(10, 1, 1, 2, 1);
		pawns[11] = getPawn(11, 2, 1, 18, 0);
		pawns[12] = getPawn(12, 3, 1, 12, 1);
		
		ai.move(bState, pawns);
		console.log('attack 14:' + (ai.pawn.depth > -1 && ai.nextMove < 18));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 15) {
		//underneath all big white pawns there is a small black pawns and black has 3 on a row
		//8765 3210 8765 3210
		bState[0][0] = parseInt('0100000000100000', 2);
		bState[0][1] = parseInt('1010000000000010', 2);
		bState[0][2] = parseInt('0000000011000000', 2);
		bState[0][3] = parseInt('0001011000000000', 2);
		
		bState[1][0] = parseInt('1011000000000000', 2);
		bState[1][1] = parseInt('0000000000000000', 2);
		bState[1][2] = parseInt('0000000000000000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 17, 1);
		pawns[1] = getPawn(1, 0, 0, 7, 1);
		pawns[2] = getPawn(2, 1, 0, 18, 0);
		pawns[3] = getPawn(3, 1, 0, 16, 0);
		pawns[4] = getPawn(4, 1, 0, 1, 1);
		pawns[5] = getPawn(5, 2, 0, 8, 1);
		pawns[6] = getPawn(6, 2, 0, 6, 1);
		pawns[7] = getPawn(7, 3, 0, 15, 0);
		pawns[8] = getPawn(8, 3, 0, 12, 1);
		pawns[9] = getPawn(9, 3, 0, 11, 1);
		//white
		pawns[10] = getPawn(10, 0, 1, 18, 1);
		pawns[11] = getPawn(11, 0, 1, 16, 1);
		pawns[12] = getPawn(12, 0, 1, 15, 1);
		
		ai.move(bState, pawns);
		console.log('defend 15:' + (ai.pawn.depth > -1 && ai.nextMove > -1));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 16) {
		//underneath all big white pawns there is a small black pawns and black has 3 on a row
		//8765 3210 8765 3210
		bState[0][0] = parseInt('0000010001100000', 2);
		bState[0][1] = parseInt('1000001000000100', 2);
		bState[0][2] = parseInt('0100000000010010', 2);
		bState[0][3] = parseInt('0010000000000000', 2);

		bState[1][0] = parseInt('1000001000000100', 2);
		bState[1][1] = parseInt('0000000000000000', 2);
		bState[1][2] = parseInt('0000000000000000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 12, 1);
		pawns[1] = getPawn(1, 0, 0, 7, 1);
		pawns[2] = getPawn(2, 0, 0, 6, 1);
		pawns[3] = getPawn(3, 1, 0, 18, 0);
		pawns[4] = getPawn(4, 1, 0, 11, 0);
		pawns[5] = getPawn(5, 1, 0, 2, 0);
		pawns[6] = getPawn(6, 2, 0, 17, 1);
		pawns[7] = getPawn(7, 2, 0, 5, 1);
		pawns[8] = getPawn(8, 2, 0, 1, 1);
		pawns[9] = getPawn(9, 3, 0, 16, 1);
		//white
		pawns[10] = getPawn(10, 0, 1, 18, 1);
		pawns[11] = getPawn(11, 0, 1, 11, 1);
		pawns[12] = getPawn(12, 0, 1, 2, 1);
		
		ai.move(bState, pawns);
		console.log('attack 16:' + (ai.pawn.depth > -1 && ai.nextMove > -1));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 17) {
		//Choose pawn from stack or board
		//8765 3210 8765 3210
		bState[0][0] = parseInt('0000010000110000', 2);
		bState[0][1] = parseInt('0000000110001000', 2);
		bState[0][2] = parseInt('0000001000000000', 2);
		bState[0][3] = parseInt('1010000000000000', 2);

		bState[1][0] = parseInt('0000000110000001', 2);
		bState[1][1] = parseInt('0001000001000000', 2);
		bState[1][2] = parseInt('0010000000000000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 13, 1);
		pawns[1] = getPawn(1, 0, 0, 6, 1);
		pawns[2] = getPawn(2, 0, 0, 5, 1);
		pawns[3] = getPawn(3, 1, 0, 3, 1);
		pawns[14] = getPawn(14, 1, 0, 8, 0);
		pawns[15] = getPawn(15, 1, 0, 10, 0);
		pawns[4] = getPawn(4, 2, 0, 11, 1);
		pawns[5] = getPawn(5, 3, 0, 18, 1);
		pawns[6] = getPawn(6, 3, 0, 16, 0);
		//white
		pawns[7] = getPawn(999, 0, 1, 10, 1);
		pawns[8] = getPawn(8, 0, 1, 8, 1);
		pawns[9] = getPawn(9, 0, 1, 0, 1);
		pawns[10] = getPawn(999, 1, 1, 15, 1);
		pawns[11] = getPawn(11, 1, 1, 7, 1);
		pawns[12] = getPawn(12, 2, 1, 16, 1);
		//stack
		pawns[13] = getPawn(999, 3, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('attack 17:' + (ai.pawn.depth === 999 && ai.nextMove > -1));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 18) {
		//Choose pawn from stack or board
		//8765 3210 8765 3210
		bState[0][0] = 0;
		bState[0][1] = parseInt('1001000000000000', 2);
		bState[0][2] = parseInt('0000010000000100', 2);
		bState[0][3] = 0;
		
		bState[1][0] = 0;
		bState[1][1] = 0;
		bState[1][2] = 0;
		bState[1][3] = 0;
		pawns = [];
		//black
		pawns[0] = getPawn(0, 1, 0, 18, 1);
		pawns[1] = getPawn(1, 1, 0, 15, 1);
		pawns[2] = getPawn(2, 2, 0, 12, 1);
		pawns[3] = getPawn(3, 2, 0, 2, 1);
		//stack
		pawns[4] = getPawn(999, 0, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('block 1:' + (ai.pawn.depth === 999 && ai.nextMove === 17));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 19) {
		//Choose pawn from stack or board
		//8765 3210 8765 3210
		bState[0][0] = parseInt('0001000000101000', 2);
		bState[0][1] = parseInt('0000001011000000', 2);
		bState[0][2] = parseInt('0000100000000000', 2);
		bState[0][3] = 0;
		bState[1][0] = parseInt('0000001001000001', 2);
		bState[1][1] = parseInt('1000000000000000', 2);
		bState[1][2] = parseInt('0110000000000000', 2);
		bState[1][3] = 0;
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 3, 1);
		pawns[1] = getPawn(1, 0, 0, 6, 1);
		pawns[2] = getPawn(2, 0, 0, 15, 1);
		pawns[3] = getPawn(3, 1, 0, 8, 1);
		pawns[4] = getPawn(4, 1, 0, 7, 0);
		pawns[5] = getPawn(5, 1, 0, 11, 0);
		pawns[6] = getPawn(6, 2, 0, 13, 1);
		//white
		pawns[7] = getPawn(7, 0, 1, 0, 1);
		pawns[8] = getPawn(8, 0, 1, 7, 1);
		pawns[9] = getPawn(9, 0, 1, 11, 1);
		pawns[10] = getPawn(10, 1, 1, 18, 1);
		pawns[11] = getPawn(11, 2, 1, 17, 1);
		pawns[12] = getPawn(12, 2, 1, 16, 1);
		//stack
		pawns[13] = getPawn(13, 3, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('block 19:' + (ai.pawn.depth === 7 && ai.nextMove === 13));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 20) {
		//Choose pawn from stack or board
		//8765 3210 8765 3210	
		bState[0][0] = parseInt('0100010000100000', 2);
		bState[0][1] = parseInt('0000000010000101', 2);
		bState[0][2] = parseInt('0010000000010000', 2);
		bState[0][3] = 0;
		bState[1][0] = parseInt('0000000000010101', 2);
		bState[1][1] = parseInt('1000000001000000', 2);
		bState[1][2] = parseInt('0100000000000000', 2);
		bState[1][3] = parseInt('0010000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 17, 1);
		pawns[1] = getPawn(1, 0, 0, 12, 1);
		pawns[2] = getPawn(2, 0, 0, 6, 1);
		pawns[3] = getPawn(3, 1, 0, 8, 1);
		pawns[4] = getPawn(4, 1, 0, 2, 0);
		pawns[5] = getPawn(5, 1, 0, 0, 0);
		pawns[6] = getPawn(6, 2, 0, 16, 1);
		pawns[7] = getPawn(7, 2, 0, 5, 0);
		//white
		pawns[8] = getPawn(8, 0, 1, 5, 1);
		pawns[9] = getPawn(9, 0, 1, 2, 1);
		pawns[10] = getPawn(10, 0, 1, 0, 1);
		pawns[11] = getPawn(11, 1, 1, 18, 1);
		pawns[12] = getPawn(12, 1, 1, 7, 1);
		pawns[13] = getPawn(13, 2, 1, 17, 0);
		pawns[14] = getPawn(14, 3, 1, 16, 0);
		//stack
		pawns[15] = getPawn(15, 2, 1, -1, 1);
		ai.move(bState, pawns);
		console.log('random 20:' + (ai.pawn.depth > -1 && ai.nextMove !== 7));
	}
	/***       *******************************************       ***/
	if((test === 0) || test === 21) {
		//3-7-11-15 will let black win
        //18   13   8    3
		bState[0][0] = parseInt('0000000001000001', 2);
		bState[0][1] = parseInt('0100000000000000', 2);
		bState[0][2] = parseInt('1000000000000000', 2);
		bState[0][3] = parseInt('0000000000000000', 2);

		bState[1][0] = parseInt('0000000000001000', 2);
		bState[1][1] = parseInt('0000000000000100', 2);
		bState[1][2] = parseInt('0000000000000010', 2);
		bState[1][3] = parseInt('1000000000000000', 2);
		pawns = [];
		//black
		pawns[0] = getPawn(0, 0, 0, 7, 1);
		pawns[1] = getPawn(1, 0, 0, 0, 1);
		pawns[2] = getPawn(2, 1, 0, 17, 1);
		pawns[3] = getPawn(3, 2, 0, 18, 1);
		//white
		pawns[4] = getPawn(4, 0, 1, 3, 1);
		pawns[5] = getPawn(5, 1, 1, 2, 1);
		pawns[6] = getPawn(6, 2, 1, 1, 1);
		pawns[7] = getPawn(7, 3, 1, 18, 0);
		//stack
		pawns[8] = getPawn(8, 0, 1, -1, 1);
		
		ai.move(bState, pawns);
		console.log('block 21:' + (ai.pawn.depth === 8 && ai.nextMove === 12));
	}
	/***       *******************************************       ***
	*						Utilities
	****       *******************************************       ***/
	if(test === 0) {
		//Get Color Underneath
		bState = [];
		bState[0] = [];
		bState[0][0] = parseInt('0000000000000000', 2);
		bState[0][1] = parseInt('0000000000001000', 2);
		bState[0][2] = parseInt('0000000000000000', 2);
		bState[0][3] = parseInt('0000000000011000', 2);
		bState[1] = [];
		bState[1][0] = parseInt('0000000000000010', 2);
		bState[1][1] = parseInt('0000000000010000', 2);
		bState[1][2] = parseInt('0000000000001000', 2);
		bState[1][3] = parseInt('0000000000000000', 2);
		
		console.log('Get Color Underneath nothing:' + (ai.getColorUnderneath(1, 0, bState) === 0));
		console.log('Get Color Underneath white:' + (ai.getColorUnderneath(3, 1, bState) === 1));
		console.log('Get Color Underneath black:' + (ai.getColorUnderneath(5, 1, bState) === 2));
		
		var a = [{id:'a', value:'1'}, {id:'b', value:'2'}, {id:'c', value:'3'}];
		console.log('getObjectFromArray: ' + (ai.getObjectFromArray(a, 'c').value === '3'));
	}
};

function getPawn(id, size, isTurn, tile, visible) {
	var p = new GOBBLET.Pawn();
	p.depth = id;
	p.size = size;
	p.onTheBoard = tile > -1;
	p.isTurn = isTurn;
	p.visible = visible;
	p.tile = tile;
	
	return p;
}
