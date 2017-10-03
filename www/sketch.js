var tile=othertile = null;
var gridsize = 10;
var gap;

var gridstart;
var optionsstarts = [];
var pointsBaner;

var grid = [];
var options = [null, null, null];
var pickedoption = null;

var points = 0;
var highscore = 0;

var ptx=pty=tx=ty=0;

var gridBG;

var lost = false;

var pickedDrawing = {
	x: 0,
	y: 0
}

var yMouseOffset = -3;
var pickedLerpRate = 0.12;

var lastKnownWindowSize = {w: 0, h: 0};

function setValues() {
	gap = width/25;
	tile = (width-gap*2)/10;
	othertile = (width-gap*3)/15;

	pointsBaner = new function () {
		this.x = gap;
		this.y = gap;
		this.w = width-(gap*2);
		this.h = this.w*130/512;
		this.fontSize = this.h*1.18+"px FontAwesome";
		this.textX = this.x+this.w/2;
		this.textY = this.y+this.h*0.905;
	}

	gridstart = {
		x: gap,
		y: pointsBaner.y+pointsBaner.h+gap,
	};

	optionsstarts[0] = { x: gap, y: gridstart.y+gridsize*tile+gap };
	optionsstarts[1] = { x: optionsstarts[0].x + gap/2 + othertile*5, y: optionsstarts[0].y };
	optionsstarts[2] = { x: optionsstarts[1].x + gap/2 + othertile*5, y: optionsstarts[0].y };

	highscoreBaner = new function () {
		this.x = gap;
		this.y = optionsstarts[0].y + othertile*5 + gap;
		this.w = width-(gap*2);
		this.h = height - this.y - gap;
		this.fontSize = this.h*1.18+"px FontAwesome";
		this.textX = this.x+this.w/2;
		this.textY = this.y+this.h*0.905;
	}
}

var sources = {
	gridBG: 'img/stone.jpg',
	tile: 'img/bg03.jpg',
	bg: 'img/bg02.jpg',
	pointsBg: 'img/wood2.jpg',
}

function setup(callback) {
	loadImages(sources);

	setValues();

	windowResized();

	resetGame();

	callback();
}

function draw() {
	if (lastKnownWindowSize.w != windowWidth || lastKnownWindowSize.h != windowHeight) {
		windowResized();
		lastKnownWindowSize.w = windowWidth;
		lastKnownWindowSize.h = windowHeight;
	}

	if (!imagesLoaded) {
		drawLoadingAnimation();
		return;
	}
	
	drawBackground();

	drawPointsBaner();
	drawHighscoreBaner();

	drawGridBG();
	drawOptionsBG();

	fillOptions();

	drawGrid();
	drawOptions();
}

function windowResized() {
	var widthToHeight = 9/16;

    var gameArea = document.getElementById('gameArea');

	var newWidth = windowWidth;
	var newHeight = windowHeight;
	var newWidthToHeight = newWidth/newHeight;

	if (newWidthToHeight > widthToHeight) {
		// window width is too wide relative to desired game width
		newWidth = newHeight * widthToHeight;
		gameArea.style.height = newHeight + 'px';
		gameArea.style.width = newWidth + 'px';
	} else { 
		// window height is too high relative to desired game height
		newHeight = newWidth / widthToHeight;
		gameArea.style.width = newWidth + 'px';
		gameArea.style.height = newHeight + 'px';
	}
	gameArea.style.marginTop = (-newHeight / 2) + 'px';
	gameArea.style.marginLeft = (-newWidth / 2) + 'px';

	resizeCanvas($('#gameArea').width(), $('#gameArea').height());
	setValues();
}

function resetGame() {
	cleanGrid();
	options = [null, null, null];
	fillOptions();
	points = 0;
	lost = false;
}

function cleanGrid() {
	for(var y=0; y<gridsize; y++) {
		grid[y] = [];
		for(var x=0; x<gridsize; x++) {
			grid[y][x] = 0;
		}
	}
}

function addPoints(amount) {
	points+=amount;
	if (points>highscore) {
		highscore = points;
	}
}

function checkGrid() {
	var colsToRemove = [];
	var rowsToRemove = [];
	for(var y=0; y<gridsize; y++) {
		var toRemove = true;
		for(var x=0; x<gridsize; x++) {
			if (grid[y][x]!=1) { toRemove=false; break; }
		}
		if (toRemove) {
			rowsToRemove.push(y);
		}
	}
	for(var x=0; x<gridsize; x++) {
		var toRemove = true;
		for(var y=0; y<gridsize; y++) {
			if (grid[y][x]!=1) { toRemove=false; break; }
		}
		if (toRemove) {
			colsToRemove.push(x);	
		}
	}
	for(var i=0; i<colsToRemove.length; i++) {
		var x = colsToRemove[i];
		for(var j=0; j<gridsize; j++) {
			grid[j][x] = 0;
		}
		addPoints(gridsize);
	}
	for(var i=0; i<rowsToRemove.length; i++) {
		var y = rowsToRemove[i];
		for(var j=0; j<gridsize; j++) {
			grid[y][j] = 0;
		}
		addPoints(gridsize);
	}
}

function mousePressed() {
	if( lost ) {
		resetGame();
		return;
	}
	for(var i=0; i<optionsstarts.length; i++) {
		if (mouseContained(optionsstarts[i].x, optionsstarts[i].y, optionsstarts[i].x+5*othertile, optionsstarts[i].y+5*othertile)) {
			if (options[i]==null) {	return; }
			pickedoption = i;
			pickedDrawing.x = optionsstarts[i].x+othertile*2.5;
			pickedDrawing.y = optionsstarts[i].y+othertile*2.5;
		}
	}
}
function mouseReleased() {
	if (pickedoption == null) { return; }
	var option = options[pickedoption];
	var xindex = floor((mouseX-gridstart.x)/tile)-2;
	var yindex = floor((mouseY-gridstart.y)/tile+yMouseOffset)-2;
	indexes = [];
	for(var y=0; y<5; y++) {
		var yy = y+yindex;
		for(var x=0; x<5; x++) {
			var xx = x+xindex;
			if (option[y][x]==1) {
				if (grid[yy]===undefined || grid[yy][xx]===undefined) {
					// Figure off grid 
					pickedoption = null; return;
				} else {
					if (grid[yy][xx] == 1) {
						// Place taken
						pickedoption = null; return;
					}
					indexes.push({y: yy, x: xx});
				}
			}
		}
	}
	for(var i=0; i<indexes.length; i++) {
		grid[indexes[i].y][indexes[i].x] = 1;
	}
	addPoints(indexes.length);
	options[pickedoption] = null;
	pickedoption = null;

	checkGrid();

	if(gameLost()) {
		lost=true;
	}
}

function gameLost() {
	if(options[0]==null && options[1]==null && options[2]==null) {
		return false;
	}
	for (var i=0; i<options.length; i++) {
		var option = options[i];
		if(option==null) { continue; }
		
		for(var yy=-4; yy<gridsize; yy++) {
			for(var xx=-4; xx<gridsize; xx++) {

				var figureFitsHere = true;
				for(var y=0; y<5; y++) {
					yindex = yy+y;
					for(var x=0; x<5; x++) {
						xindex = xx + x;
						if (option[y][x]==1) {
							if (grid[yindex]===undefined || grid[yindex][xindex]===undefined || grid[yindex][xindex] == 1) {
								y=x=5;
								figureFitsHere = false;
								break;
							}
						}
					}
				}
				if(figureFitsHere) {
					return false;
				}
			}
		}
	}
	return true;
}

function mouseContained(x1, y1, x2, y2) {
	if (mouseX>x1 && mouseX<x2 && mouseY>y1 && mouseY<y2) {
		return true;
	} else {
		return false;
	}
}

function fillOptions() {
	if (options[0]==null && options[1]==null && options[2]==null) {
		for(var i=0; i<options.length; i++) {
			options[i] = figures[floor(random(0, figures.length))].slice();
		}
	}
}

function drawGrid() {
	fill(color(40,40,40, 200));
	var drawY = gridstart.y;
	for(var y=0; y<grid.length; y++) {
		var drawX = gridstart.x;
		for(var x=0; x<grid[y].length; x++) {
			if (grid[y][x] == 1) {
				image(images.tile, drawX, drawY, tile, tile);
			}
			drawX+=tile
		}
		drawY+=tile;
	}
}

function drawGridBG() {
	image(images.gridBG, gridstart.x, gridstart.y, tile*gridsize, tile*gridsize);

	/*noStroke();
	var c = 0;
	var drawY = gridstart.y;
	for(var y=0; y<gridsize; y++) {
		var drawX = gridstart.x;
		for(var x=0; x<gridsize; x++) {
			if (c%2) { fill(100, 40 , 30); } else { fill(120, 50 , 40); }
			rect(drawX, drawY, tile, tile);
			c++;
			drawX+=tile
		}
		c++;
		drawY+=tile
	}*/
}

function drawOptions() {
	if (pickedoption || pickedoption==0) {
		pickedDrawing.x = lerp(pickedDrawing.x, mouseX, pickedLerpRate);
		pickedDrawing.y = lerp(pickedDrawing.y, mouseY+yMouseOffset*tile, pickedLerpRate);
	}
	
	for(var i=0; i<options.length; i++) {
		figure = options[i];
		if (figure==null) { continue; }
		var drawMY = pickedDrawing.y-tile*2.5;
		var drawY = optionsstarts[i].y;
		for(var y=0; y<figure.length; y++) {
			var drawMX = pickedDrawing.x-tile*2.5;
			var drawX = optionsstarts[i].x;
			for(var x=0; x<figure[y].length; x++) {
				if (figure[y][x] == 1) {
					if (pickedoption == i) {
						image(images.tile, drawMX, drawMY, tile, tile);
					} else {
						image(images.tile, drawX, drawY, othertile, othertile);
					}
				}
				drawMX += tile;
				drawX += othertile;
			}
			drawMY += tile;
			drawY += othertile;
		}
	}
}

function drawOptionsBG() {
	drawOptionBackground(optionsstarts[0].x, optionsstarts[0].y);
	drawOptionBackground(optionsstarts[1].x, optionsstarts[1].y);
	drawOptionBackground(optionsstarts[2].x, optionsstarts[2].y);
	function drawOptionBackground(startx, starty) {
		//noStroke();
		var c = 0;
		var drawY = starty;
		for(var y=0; y<5; y++) {
			var drawX = startx;
			for(var x=0; x<5; x++) {
				if (c%2) { fill(color(211, 209 , 173)); } else { fill(color(191, 189 , 153)); }
				rect(drawX, drawY, othertile, othertile);
				c++;
				drawX += othertile;
			}
			drawY += othertile;
		}
	}	
}

function drawLoadingAnimation() {
	background(color(51,51,51));
	textAlign("center");
	push();
		fill('white');
		translate(width/2, height/2);
		text("Loading...", 0, 0);
	pop();
}

function drawPointsBaner() {
	image(images.pointsBg, pointsBaner.x, pointsBaner.y, pointsBaner.w, pointsBaner.h);
	font(pointsBaner.fontSize);
	textAlign("center");
	if(lost) { fill('blue'); }
	text(points, pointsBaner.textX, pointsBaner.textY);
}

function drawHighscoreBaner() {
	image(images.pointsBg, highscoreBaner.x, highscoreBaner.y, highscoreBaner.w, highscoreBaner.h);
	font(highscoreBaner.fontSize);
	textAlign("center");
	text(highscore, highscoreBaner.textX, highscoreBaner.textY);
}

function drawBackground() {
	image(images.bg, 0, 0, width, height);
}

