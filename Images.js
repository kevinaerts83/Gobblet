var WELCOME = WELCOME || {};
var GOBBLET = GOBBLET || {};
var humanPlayer = 0;
var level = 0;
var isView = true;
var canvasImg = document.getElementById('images');
var elements = [];

WELCOME.CloseModal = function(e) {
	var el = document.getElementById('openModal');
	if(!el.hasAttribute('hidden')) {
		el.setAttribute('hidden', true);
	}
	e.preventDefault();
};
WELCOME.English = function(e) {
	document.getElementById('divEn').style.display='block';
	document.getElementById('divNl').style.display='none';
	e.preventDefault();
};
WELCOME.Dutch = function(e) {
	document.getElementById('divEn').style.display='none';
	document.getElementById('divNl').style.display='block';
	e.preventDefault();
};
WELCOME.OpenModal = function() {
	document.getElementById('openModal').removeAttribute('hidden');
};
WELCOME.HideMenu = function() {
	isView = false;//default is true
	document.getElementById('welcome').style.display='none';
	document.getElementById('game').style.display='block';
};
WELCOME.ShowMenu = function() {
	isView = false;
	document.getElementById('welcome').style.display='block';
	document.getElementById('game').style.display='none';
};
WELCOME.getPlayerKey = function(player) {
	return "player" + player + level;
};
WELCOME.getPlayerScore = function(player) {
	var score;
	if(localStorage && localStorage.getItem) {
		score = Number(localStorage.getItem(WELCOME.getPlayerKey(player)));
	} else {
		score = 0;
	}
	if(score === undefined) {
		score = 0;
	}
	return score;
};
WELCOME.IncreaseScore = function(player) {
	if(localStorage && localStorage.setItem) {
		localStorage.setItem(WELCOME.getPlayerKey("0"), WELCOME.getPlayerScore("0"));
		localStorage.setItem(WELCOME.getPlayerKey("1"), WELCOME.getPlayerScore("1"));
	}
	var score = WELCOME.getPlayerScore(player) + 1;
	if(localStorage && localStorage.setItem) {
		localStorage.setItem(WELCOME.getPlayerKey(player), score);
	}
	WELCOME.drawImages();
};
WELCOME.Reset = function() {
	if(localStorage && localStorage.removeItem) {
		localStorage.removeItem(WELCOME.getPlayerKey("0"));
		localStorage.removeItem(WELCOME.getPlayerKey("1"));
	}
	WELCOME.drawImages();
};
WELCOME.ChangePlayer = function() {
	level++;
	if(level === 4) {
		level = 0;
	}
	if(localStorage && localStorage.setItem) {
		localStorage.setItem("GobbletLevel", level);
	}
	WELCOME.drawImages();
};
WELCOME.Start = function() {
	if(level === 3) {
		checkConnection();
	} else {
		WELCOME.HideMenu();
		GOBBLET.Start();
	}
};

/* immediate function */
(function(w, h) {
	document.getElementById("images").width = w;
	document.getElementById("images").height = h;
	document.getElementById("canvas").width = w;
	document.getElementById("canvas").height = h;
}(document.body.clientWidth, window.innerHeight));

WELCOME.ClickEvent = function(x, y) {
	// Collision detection between clicked offset and element.
	elements.forEach(function(element) {
	    if (y > element.top && y < (element.top + element.height) && x > element.left && x < (element.left + element.width)) {
	    	if(element.id==='player2') {
	    		WELCOME.ChangePlayer();
	    	} else if(element.id === 'start') {
	    		WELCOME.Start();
	    	} else if(element.id === 'reset') {
	    		WELCOME.Reset();
	    	} else if(element.id === 'view') {
	    		if(isView === false) {
	        		WELCOME.HideMenu();//set view on false;
	        		isView = true;
	    		}
	    	} else if(element.id === 'help') {
	    		WELCOME.OpenModal();
	    	}
	    }
	});
};

//colors for player1: #282828//'#8B4513'
elements.push({id: 'player1', colour:'#003955', width:100, height:140, top:200, left:canvasImg.width/6-40});
elements.push({id: 'player2', colour:'#D2B48C', width: 100, height: 140, top: 200, left: canvasImg.width*5/6-40});
elements.push({id: 'start', colour:'#606061', width: 60, height: 60, top: 200, left: canvasImg.width/2-40});
elements.push({id: 'view', colour:'#606061', width: 60, height: 60, top: 280, left: canvasImg.width/2-40});
elements.push({id: 'reset', colour:'#606061', width: 60, height: 60, top: 360, left: canvasImg.width/2-40});
elements.push({id: 'help', colour:'#606061', width: 60, height: 60, top: 440, left: canvasImg.width/2-40});

WELCOME.drawImages = function() {
	var ctx = canvasImg.getContext('2d'), font = '52pt Verdana', h1=80, h3 = 250;
	ctx.clearRect(0, 0, canvasImg.width, canvasImg.height);
	ctx.save();
	
	if(canvasImg.width < 540 || canvasImg.height < 540) {
		font = '32pt Verdana';
		h1 = 65;
		h3 = 180;
		document.getElementById('popup').style.marginTop = '20px';
		document.getElementById('divEn').style.overflowY = 'scroll';
		document.getElementById('divEn').style.height = '200px';
		document.getElementById('divNl').style.overflowY = 'scroll';
		document.getElementById('divNl').style.height = '200px';
		
		if(elements[0].top === 200) {
			elements[0].top = 100;//100
			elements[0].left += 10;//10
			
			elements[1].top = 100;//100
			elements[1].left -= 10;//10
			
			elements[2].top = 100;//120
			elements[2].left += 20;//35
			
			elements[3].top = 160;//120
			elements[3].left += 20;//55
			
			elements[4].top = 220;//190
			elements[4].left += 20;//35
			
			elements[5].top = 280;//190
			elements[5].left += 20;//55
		}
	}
	if(localStorage && localStorage.getItem) {
		level = Number(localStorage.getItem("GobbletLevel"));
	}
	if(level === undefined) {
		level = 0;
	}

	WELCOME.drawTextInCanvas(ctx , 'Gobblet', canvasImg.width/2, h1, 4, font);
	
	ctx.restore();
	
	// Render elements.
	elements.forEach(function(element) {
		if(element.id === 'player1') {
			WELCOME.drawFigure(ctx, element.colour, element.left, element.top);
			ctx.beginPath();
			ctx.font = font;
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			ctx.fillText(WELCOME.getPlayerScore("0"), element.left + 38, element.top + h3);
			ctx.closePath();
		}
		else if(element.id === 'player2') {
			if(level === 3) {
				humanPlayer = 1;
				WELCOME.drawCloud(ctx, element.colour, element.left, element.top);
			} else if(level === 2) {
				humanPlayer = 1;
				WELCOME.drawFigure(ctx, element.colour, element.left, element.top);
			} else {
				humanPlayer = 0;
				WELCOME.drawPC(ctx, element.colour, element.left-15, element.top);
			}
			ctx.beginPath();
			ctx.font = font;
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			ctx.fillText(WELCOME.getPlayerScore("1"), element.left + 38, element.top + h3);
			ctx.closePath();
		}
		else {
			WELCOME.drawButton(ctx, element.colour, element.left, element.top, element.id);
		}
		//ctx.rect(element.left, element.top, element.width, element.height);
		//ctx.stroke();
	});
};
WELCOME.drawButton = function(ctx, color, w, h, id) {
	var i, round = 2*Math.PI, radius = 30, 
	top = 10, bottom = 50, left = 20, right = 50,
	eyeLeft = [22,25,39,42], eyeTop = [20,22,20,22], eyeRadius = [6,2,6,2], 
	offset = 0, oTop = 0;
	if(canvasImg.width < 540 || canvasImg.height < 540) {
		radius = 20; 
		top = 7; bottom = 34; left = 15; right = 34;
		eyeLeft = [14,16,26,28]; eyeTop = [14,16,14,16]; eyeRadius = [4,1,4,1];
		offset = 11; oTop = 10;
	}
	ctx.save();
	ctx.beginPath();
	ctx.arc(w+radius,h+radius,radius,0,round);
	
	ctx.lineWidth = 2;
	ctx.fillStyle = color;
	
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 15;
	ctx.shadowOffsetX = 5;
	ctx.shadowOffsetY = 5;
	
	ctx.fill();
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.closePath();

	if(id==='start') {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.moveTo(w+left,h+top);
		ctx.lineTo(w+right,h+(bottom - top)/2+top);
		ctx.lineTo(w+left,h+bottom);
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle = 'black';
		ctx.stroke();
		ctx.closePath();
	} else if(id==='view') {
		for(i = 0; i < 4; i++) {
			ctx.beginPath();
			ctx.arc(w+eyeLeft[i],h+eyeTop[i],eyeRadius[i],0,round);
			ctx.fillStyle = i % 2 ? 'black' : 'white';
			ctx.fill();
			ctx.closePath();
		}
	} else if(id==='reset') {
		w -= offset;
		h -= oTop;
		ctx.beginPath();
		ctx.moveTo(w+18,h+25);
		ctx.lineTo(w+25,h+45);
		ctx.lineTo(w+38,h+45);
		ctx.lineTo(w+45,h+25);
		ctx.lineTo(w+18,h+25);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'black';
		ctx.moveTo(w+24,h+27);
		ctx.lineTo(w+28,h+42);
		ctx.stroke();
		
		ctx.moveTo(w+31,h+27);
		ctx.lineTo(w+31,h+42);
		ctx.stroke();
		
		ctx.moveTo(w+39,h+27);
		ctx.lineTo(w+35,h+42);
		ctx.stroke();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'white';
		ctx.moveTo(w+20,h+15);
		ctx.lineTo(w+45,h+20);
		ctx.stroke();
		
		ctx.moveTo(w+31,h+15);
		ctx.lineTo(w+35,h+16);
		ctx.stroke();
		ctx.closePath();
	} else if(id==='help') {
		w -= offset;
		h -= oTop*4/3;
		ctx.beginPath();
		ctx.font = (40 - offset) + 'pt Book Antiqua';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText("?", w+30, h+48);
		ctx.closePath();
	}
	ctx.restore();
};
WELCOME.drawTextInCanvas = function(ctx, texttowrite, wdth, hght, dpth, font) {
	ctx.save();
	ctx.font = font;
	ctx.fillStyle = 'Yellow';
	ctx.textAlign = 'center';
	var cnt;
	for (cnt = 0; cnt < dpth; cnt+=1) {
		ctx.fillText(texttowrite, wdth - cnt, hght - cnt);
	}
	// shadow casting in bottom layers
	ctx.fillStyle = '#008080';
	ctx.shadowColor = 'black';
	ctx.shadowBlur = 8;
	ctx.shadowOffsetX = dpth + 2;
	ctx.shadowOffsetY = dpth + 2;
	ctx.fillText(texttowrite, wdth - cnt, hght - cnt);
	ctx.restore();
};
WELCOME.drawFigure = function(ctx, color, offsetX, offsetY) {
	var gradient1, gradient2, outlineColor = '#' + ((parseInt(color.substr(1), 16) & 0xfefefe) >> 1).toString(16);

	gradient1 = ctx.createRadialGradient(37.7+offsetX, 55.6+offsetY, 0.0, 37.7+offsetX, 55.6+offsetY, 46.1);
	gradient1.addColorStop(0.00, '#fff');
	gradient1.addColorStop(1.00, color);
	
	gradient2 = ctx.createRadialGradient(37.7+offsetX, 15.3+offsetY, 0.0, 37.6+offsetX, 15.3+offsetY, 31.1);
	gradient2.addColorStop(0.00, '#fff');
	gradient2.addColorStop(1.00, color);
	
	ctx.save();
	//draw body
	ctx.beginPath();
	ctx.moveTo(73.1+offsetX, 83.6+offsetY);
	ctx.bezierCurveTo(71.7+offsetX, 102.1+offsetY, 52.2+offsetX, 105.2+offsetY, 37.4+offsetX, 105.2+offsetY);
	ctx.bezierCurveTo(22.5+offsetX, 105.2+offsetY, 3.0+offsetX, 102.1+offsetY, 1.6+offsetX, 83.6+offsetY);
	ctx.bezierCurveTo(0.1+offsetX, 62.7+offsetY, 14.0+offsetX, 35.3+offsetY, 37.4+offsetX, 35.3+offsetY);
	ctx.bezierCurveTo(60.8+offsetX, 35.3+offsetY, 74.7+offsetX, 62.7+offsetY, 73.1+offsetX, 83.6+offsetY);
	ctx.closePath();
	ctx.fillStyle = gradient1;
	ctx.fill();
	ctx.lineWidth = 2.0;
	ctx.lineJoin = 'miter';
	ctx.miterLimit = 4.0;
	ctx.strokeStyle = outlineColor;
	ctx.stroke();
	//draw head
	ctx.beginPath();
	ctx.moveTo(61.2+offsetX, 25.3+offsetY);
	ctx.bezierCurveTo(61.2+offsetX, 38.4+offsetY, 50.5+offsetX, 49.1+offsetY, 37.4+offsetX, 49.1+offsetY);
	ctx.bezierCurveTo(24.2+offsetX, 49.1+offsetY, 13.6+offsetX, 38.4+offsetY, 13.6+offsetX, 25.3+offsetY);
	ctx.bezierCurveTo(13.6+offsetX, 12.1+offsetY, 24.2+offsetX, 1.5+offsetY, 37.4+offsetX, 1.5+offsetY);
	ctx.bezierCurveTo(50.5+offsetX, 1.5+offsetY, 61.2+offsetX, 12.1+offsetY, 61.2+offsetX, 25.3+offsetY);
	ctx.closePath();
	ctx.fillStyle = gradient2;
	ctx.fill();
	ctx.strokeStyle = outlineColor;
	ctx.stroke();
	ctx.restore();
};

WELCOME.drawCloud = function(ctx, color, offsetX, offsetY) {
	offsetX -= 110;
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(85+offsetX, 40+offsetY);
	ctx.bezierCurveTo(65+offsetX, 50+offsetY, 65+offsetX, 75+offsetY, 115+offsetX, 75+offsetY);
	ctx.bezierCurveTo(125+offsetX, 90+offsetY, 160+offsetX, 90+offsetY, 170+offsetX, 75+offsetY);
	ctx.bezierCurveTo(210+offsetX, 75+offsetY, 210+offsetX, 60+offsetY, 195+offsetX, 50+offsetY);
	ctx.bezierCurveTo(215+offsetX, 20+offsetY, 185+offsetX, 15+offsetY, 170+offsetX, 25+offsetY);
	ctx.bezierCurveTo(160+offsetX, 2.5+offsetY, 125+offsetX, 10+offsetY, 125+offsetX, 25+offsetY);
	ctx.bezierCurveTo(100+offsetX, 2.5+offsetY, 75+offsetX, 10+offsetY, 85+offsetX, 40+offsetY);
	ctx.closePath();
	ctx.lineWidth = 5;
	ctx.fillStyle = '#F8FADE';
	ctx.fill();
	ctx.strokeStyle = color;
	ctx.stroke();
	ctx.restore();
};

WELCOME.drawPC = function(ctx, color, offsetX, offsetY) {
	var start = offsetX + 30,
		padding = 5,
		width = 70,
		depth = 5,
		end = start + width + depth,
		kbDepth = 20,
		kbWidth = width+padding*4,
		kbH = 20,
		kbY = offsetY + depth + width + kbH + padding,
		/*eye = 3,
		nose = 4,
		eyePosY = offsetY + depth + (width / 3),
		eyePosXS = start + (width / 3),
		eyePosXE = start + (2 * width / 3),
		mounth = center + padding * 2,*/
		center = offsetY + depth + (width / 2),
		gradient1 = ctx.createRadialGradient(start, center-width/2, 0.0, start+30, center, width),
		colour = ctx.createLinearGradient(offsetX, offsetY, offsetX + width+20, offsetY);
	
	colour.addColorStop(0, '#fff');   
	colour.addColorStop(1, color);
	
	gradient1.addColorStop(0.00, '#fff');
	gradient1.addColorStop(1.00, '#003955');
	
	ctx.save();
	ctx.beginPath();
	
	ctx.lineWidth="1";
	ctx.strokeStyle='#' + ((parseInt(color.substr(1), 16) & 0xfefefe) >> 1).toString(16);
	ctx.fillStyle=colour;
	
	//screen
	ctx.beginPath();
	ctx.moveTo(start,offsetY+depth);
	ctx.rect(start,offsetY+depth,width,width);
	ctx.stroke();
	ctx.fill();
	
	ctx.beginPath();
	ctx.fillStyle=gradient1;
	ctx.rect(start + padding, offsetY + depth + padding, width - padding * 2, width - padding * 2);
	ctx.stroke();
	ctx.fill();
	
	ctx.beginPath();
	ctx.fillStyle=colour;
	
	ctx.beginPath();
	ctx.moveTo(start, offsetY+depth);
	ctx.lineTo(start + depth, offsetY);
	ctx.lineTo(end, offsetY);
	ctx.lineTo(start + width, offsetY+depth);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(end,offsetY);
	ctx.lineTo(end,offsetY+width);
	ctx.lineTo(start + width,offsetY + width + depth);
	ctx.lineTo(start + width,offsetY + depth);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	
	//face
	/*ctx.beginPath();
	ctx.fillStyle='black';
	
	ctx.moveTo(start + (width / 2), center - nose);
	ctx.lineTo(start + (width / 2), center);
	ctx.stroke();

	ctx.moveTo(eyePosXS + eye, eyePosY);
	ctx.arc(eyePosXS, eyePosY, eye, 0, 2*Math.PI);
	ctx.fill();
	
	ctx.moveTo(eyePosXE + eye, eyePosY);
	ctx.arc(eyePosXE, eyePosY, eye, 0, 2*Math.PI);
	ctx.fill();
	
	ctx.moveTo(eyePosXS, mounth);
	ctx.quadraticCurveTo(eyePosXS, mounth + width/4, eyePosXE, mounth);
	ctx.stroke();
	ctx.fill();*/
	
	//keyboard
	ctx.beginPath();
	ctx.lineWidth="2";
	ctx.fillStyle=colour;
	ctx.rect(offsetX, kbY, kbWidth, padding); 
	ctx.stroke();
	ctx.fill();
	
	ctx.beginPath();
	ctx.moveTo(offsetX, kbY);
	ctx.lineTo(offsetX + kbDepth, kbY - kbH);
	ctx.lineTo(offsetX + kbWidth + kbDepth, kbY - kbH);
	ctx.lineTo(offsetX + kbWidth, kbY);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(offsetX + kbWidth + kbDepth, kbY - kbH);
	ctx.lineTo(offsetX + kbWidth + kbDepth, kbY - kbH + padding);
	ctx.lineTo(offsetX + kbWidth, kbY + padding);
	ctx.lineTo(offsetX + kbWidth, kbY);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	
	ctx.font = '12pt Verdana';
	ctx.fillStyle = 'Black';
	ctx.fillText(level ? 'hard' : 'easy', offsetX + kbWidth/2, kbY+25);
	ctx.restore();
};

document.getElementById('aClose').addEventListener('touchend', WELCOME.CloseModal);
document.getElementById('aEn').addEventListener('touchend', WELCOME.English);
document.getElementById('aNl').addEventListener('touchend', WELCOME.Dutch);
document.getElementById('aClose').addEventListener('click', WELCOME.CloseModal);
document.getElementById('aEn').addEventListener('click', WELCOME.English);
document.getElementById('aNl').addEventListener('click', WELCOME.Dutch);

canvasImg.addEventListener('click', function(event) { WELCOME.ClickEvent(event.pageX, event.pageY); event.preventDefault();}, false);
canvasImg.addEventListener('touchstart', function(event) { WELCOME.ClickEvent(event.touches[0].pageX, event.touches[0].pageY); event.preventDefault();}, false);
/* initialize welcome screen */
WELCOME.drawImages();