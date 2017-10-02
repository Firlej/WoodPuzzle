var tile=othertile = null;
var gridsize = 10;
var gap;

var gridstart;
var optionsstarts = [];

var grid = [];
var options = [null, null, null];
var pickedoption = null;

var points = 0;

var ptx=pty=tx=ty=0;

var gridBG;

var lost = false;

var pickedDrawing = {
	x: 0,
	y: 0
}

var yMouseOffset = -2;
var pickedLerpRate = 0.12;

function setValues() {
	gap = width/20;
	$('#points').css("top", gap+'px');
	tile = (width-gap*2)/10;
	othertile = (width-gap*3)/15;

	$('#ad').css("left", $('#gameArea').width()/2 - $('#ad').outerWidth()/2 );

	gridstart = { x: gap, y: (width-(gap*2))*130/512+gap*2, };
	optionsstarts[0] = { x: gap, y: gridstart.y+gridsize*tile+gap };
	optionsstarts[1] = { x: gap + gap/2 + othertile*5, y: optionsstarts[0].y };
	optionsstarts[2] = { x: gap + gap + othertile*10, y: optionsstarts[0].y };
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

	cleanGrid();


	callback();
}

function draw() {
	if (!imagesLoaded) {
		drawLoadingAnimation();
		return;
	}
	
	image(images.bg, 0, 0, width, height);

	image(images.pointsBg, gap, gap, width-(gap*2),(width-(gap*2))*130/512);
	font(((width-(gap*2))*130/512)+"px Arial");
	textAlign("center");
	if(lost) { fill('blue'); }
	text(points,width/2,1.08*((width-(gap*2))*130/512));

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
		//$('#points').css("font-size", "11.7vh");
		//console.log(1);
	} else { 
		// window height is too high relative to desired game height
		newHeight = newWidth / widthToHeight;
		gameArea.style.width = newWidth + 'px';
		gameArea.style.height = newHeight + 'px';
		//$('#points').css("font-size", "20.6vw");
		//console.log(2);
	}
	//$('#points').css("font-size", (newWidth / 75) + 'em');
	gameArea.style.marginTop = (-newHeight / 2) + 'px';
	gameArea.style.marginLeft = (-newWidth / 2) + 'px';

	resizeCanvas($('#gameArea').width(), $('#gameArea').height());
	setValues();
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
}

function checkGrid() {
	for(var y=0; y<gridsize; y++) {
		var good = true;
		for(var x=0; x<gridsize; x++) {
			if (grid[y][x]!=1) { good=false; break; }
		}
		if (good) {
			for(var i=0; i<gridsize; i++) {
				grid[y][i] = 0;
			}
			addPoints(gridsize);
		}
	}
	for(var x=0; x<gridsize; x++) {
		var good = true;
		for(var y=0; y<gridsize; y++) {
			if (grid[y][x]!=1) { good=false; break; }
		}
		if (good) {
			for(var i=0; i<gridsize; i++) {
				grid[i][x] = 0;
			}
			addPoints(gridsize);
		}
	}
}

function mousePressed() {
	for(var i=0; i<optionsstarts.length; i++) {
		if (mouseContained(optionsstarts[i].x, optionsstarts[i].y, optionsstarts[i].x+5*othertile, optionsstarts[i].y+5*othertile)) {
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
					console.log("Figure off grid!");
					pickedoption = null; return;
				} else {
					if (grid[yy][xx] == 1) {
						console.log("Place taken!");
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
		console.log("GAME LOST");
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
		
		for(var yy=0; yy<gridsize; yy++) {
			for(var xx=0; xx<gridsize; xx++) {

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
	//stroke(0);
	var drawTile = tile-4;
	var drawY = gridstart.y+2;
	for(var y=0; y<grid.length; y++) {
		var drawX = gridstart.x+2;
		for(var x=0; x<grid[y].length; x++) {
			if (grid[y][x] == 1) {
				image(images.tile, drawX, drawY, drawTile, drawTile);
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
	console.log(pickedDrawing.x, pickedDrawing.y);
	if (pickedoption || pickedoption==0) {
		pickedDrawing.x = lerp(pickedDrawing.x, mouseX, pickedLerpRate);
		pickedDrawing.y = lerp(pickedDrawing.y, mouseY+yMouseOffset*tile, pickedLerpRate);
	}
	
	for(var i=0; i<options.length; i++) {
		figure = options[i];
		if (figure==null) { continue; }
		var drawMY = pickedDrawing.y-tile*2.5+2;
		var drawY = optionsstarts[i].y+2;
		for(var y=0; y<figure.length; y++) {
			var drawMX = pickedDrawing.x-tile*2.5+2;
			var drawX = optionsstarts[i].x+2;
			for(var x=0; x<figure[y].length; x++) {
				if (figure[y][x] == 1) {
					if (pickedoption == i) {
						image(images.tile, drawMX, drawMY, tile-4, tile-4);
					} else {
						image(images.tile, drawX, drawY, othertile-4, othertile-4);
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
var loadingObj = {
	rotation: 0,
	r: 40,
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