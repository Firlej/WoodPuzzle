var tile = othertile = null;
var gridsize = 10;
var gap;
var borderWidth = 0;

var gridstart;
var optionsstarts = [];
var pointsBaner;

var grid = [];
var options = [null, null, null];
var pickedoption = null;
var removedTiles = [];

var points = 0;
var highscore = 0;

var gridBG;

var lost = false;
var gameReady = false;

var pickedDrawing = {
	x: 0,
	y: 0
};

var constyMouseOffset = -5.5;
var xMouseOffset = 0;
var yMouseOffset = 0;
var pickedLerpRate = 0.17;

var lastKnownWindowSize = {
	w: 0,
	h: 0
};

function setValues() {
	gap = floor(width / 25);
	borderWidth = gap / 2;
	tile = (width - gap * 2 - borderWidth * 2) / 10;
	othertile = (width - gap * 3) / 15;

	pointsBaner = new function () {
		this.w = (width - (gap * 2)) / 2.2;
		this.h = this.w * 160 / 512;
		this.x = gap;
		this.y = gap * 2;
		this.fontSize = this.h * 0.95 + "px FontAwesome";
		this.textX = this.x + this.w / 2;
		this.textY = this.y + this.h * 0.83;
	}
	gridBorder = {
		w: tile * gridsize + borderWidth * 2,
		h: tile * gridsize + borderWidth * 2,
		x: gap,
		y: pointsBaner.y + pointsBaner.h + gap * 2
	};
	gridstart = {
		x: gap + borderWidth,
		y: pointsBaner.y + pointsBaner.h + gap * 2 + borderWidth,
		w: tile * gridsize,
		h: tile * gridsize
	};

	optionsstarts[0] = {
		x: gap,
		y: gridBorder.y + gridBorder.h + gap * 2
	};
	optionsstarts[1] = {
		x: optionsstarts[0].x + gap / 2 + othertile * 5,
		y: optionsstarts[0].y
	};
	optionsstarts[2] = {
		x: optionsstarts[1].x + gap / 2 + othertile * 5,
		y: optionsstarts[0].y
	};

	highscoreBaner = new function () {
		this.x = pointsBaner.x + pointsBaner.w + (width - gap / 2 - 2 * pointsBaner.w);
		this.y = pointsBaner.y;
		this.w = pointsBaner.w;
		this.h = pointsBaner.h;
		this.fontSize = this.h * 0.95 + "px FontAwesome";
		this.textX = this.x + this.w / 2;
		this.textY = this.y + this.h * 0.83;
	}
}

var sources = {
	gridBG: 'img/gridbg.png',
	tile: 'img/tile.png',
	bg: 'img/bg.png',
	pointsBg: 'img/baner.png',
	crown: 'img/crown.png',
}

function setup(callback) {
	loadImages(sources);

	setValues();
	windowResized();

	resetGame();
	getLocalStorage();

	gameReady = true;

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
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// drawBackground();

	drawPointsBaner();
	drawHighscoreBaner();

	drawGridBG();
	// drawOptionsBG();

	drawShadowFigure();

	drawGrid();
	drawOptions();
}

function checkIfFigureFits(xx, yy, option) {
	var figureFitsHere = true;
	for (var y = 0; y < 5; y++) {
		yindex = yy + y;
		for (var x = 0; x < 5; x++) {
			xindex = xx + x;
			if (option[y][x] == 1) {
				if (grid[yindex] === undefined || grid[yindex][xindex] === undefined || grid[yindex][xindex] == 1) {
					y = x = 5;
					figureFitsHere = false;
					break;
				}
			}
		}
	}
	return figureFitsHere;
}

function drawShadowFigure() {
	if (pickedoption != null) {
		var xindex = floor((mouseX - gridstart.x) / tile + xMouseOffset) - 2;
		var yindex = floor((mouseY - gridstart.y) / tile + yMouseOffset) - 2;

		fill(rgba(1, 1, 1, 0.3));
		for (let y = 0; y < 5; y++) {
			for (let x = 0; x < 5; x++) {
				let option = options[pickedoption];
				if (option[y][x] == 1 && checkIfFigureFits(xindex, yindex, option)) {
					rect(gridstart.x + (xindex + x) * tile, gridstart.y + (yindex + y) * tile, tile, tile);
				}
			}
		}
	}
}

function windowResized() {
	var widthToHeight = 9 / 16;

	var gameArea = document.getElementById('gameArea');

	var newWidth = windowWidth;
	var newHeight = windowHeight;
	var newWidthToHeight = newWidth / newHeight;

	var fontSize = 12;
	var lostScoreSpanHeight = 24.3;

	if (newWidthToHeight > widthToHeight) {
		// window width is too wide relative to desired game width
		newWidth = newHeight * widthToHeight;
		gameArea.style.height = newHeight + 'px';
		gameArea.style.width = newWidth + 'px';

		$('#lostScoreSpan').css({
			'height': lostScoreSpanHeight + 'vh',
			'line-height': lostScoreSpanHeight + 'vh',
			'font-size': fontSize + 'vh'
		});
	} else {
		// window height is too high relative to desired game height
		newHeight = newWidth / widthToHeight;
		gameArea.style.width = newWidth + 'px';
		gameArea.style.height = newHeight + 'px';

		$('#lostScoreSpan').css({
			'height': (lostScoreSpanHeight / widthToHeight) + 'vw',
			'line-height': (lostScoreSpanHeight / widthToHeight) + 'vw',
			'font-size': (fontSize / widthToHeight) + 'vw'
		});
	}
	// gameArea.style.fontSize = ($('#gameArea').width()*$('#gameArea').height() / 9500) + 'px';

	gameArea.style.marginTop = (-newHeight / 2) + 'px';
	gameArea.style.marginLeft = (-newWidth / 2) + 'px';

	resizeCanvas($('#gameArea').width(), $('#gameArea').height());
	setValues();
}

function getLocalStorage() {
	highscore = getFromLocalStorage('highscore') ? parseInt(getFromLocalStorage('highscore')) : 0;
	points = getFromLocalStorage('points') ? parseInt(getFromLocalStorage('points')) : 0;
	if (localStorage.grid) {
		grid = JSON.parse(localStorage.grid);
	}
	if (getFromLocalStorage('options')) {
		options = JSON.parse(getFromLocalStorage('options'));
	}
}

function saveToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
	return localStorage[key];
}

function saveCurrentState() {
	saveToLocalStorage("grid", grid);
	saveToLocalStorage("options", options);
	saveToLocalStorage("points", points);
	saveToLocalStorage("highscore", highscore);
}

function resetGame() {
	cleanGrid();
	options = [null, null, null];
	fillOptions();
	points = 0;
	lost = false;
}

function cleanGrid() {
	for (var y = 0; y < gridsize; y++) {
		grid[y] = [];
		for (var x = 0; x < gridsize; x++) {
			grid[y][x] = 0;
		}
	}
}

function addPoints(amount) {
	points += amount;
	saveToLocalStorage("points", points);
	if (points > highscore) {
		highscore = points;
		saveToLocalStorage("highscore", highscore);
	}
	//saveCurrentState();
}

function checkGrid() {
	var colsToRemove = [];
	var rowsToRemove = [];
	for (var y = 0; y < gridsize; y++) {
		var toRemove = true;
		for (var x = 0; x < gridsize; x++) {
			if (grid[y][x] != 1) {
				toRemove = false;
				break;
			}
		}
		if (toRemove) {
			rowsToRemove.push(y);
		}
	}
	for (var x = 0; x < gridsize; x++) {
		var toRemove = true;
		for (var y = 0; y < gridsize; y++) {
			if (grid[y][x] != 1) {
				toRemove = false;
				break;
			}
		}
		if (toRemove) {
			colsToRemove.push(x);
		}
	}
	for (var i = 0; i < colsToRemove.length; i++) {
		var x = colsToRemove[i];
		for (var j = 0; j < gridsize; j++) {
			grid[j][x] = 0;
		}
	}
	for (var i = 0; i < rowsToRemove.length; i++) {
		var y = rowsToRemove[i];
		for (var j = 0; j < gridsize; j++) {
			grid[y][j] = 0;
		}
	}
	var pointsToAdd = (colsToRemove.length + rowsToRemove.length) * gridsize;
	addPoints(pointsToAdd);

	saveToLocalStorage("grid", grid);
	saveToLocalStorage("options", options);
}

function mousePressed() {
	if (lost) {
		return;
	}
	for (var i = 0; i < optionsstarts.length; i++) {
		if (mouseContained(optionsstarts[i].x, optionsstarts[i].y, optionsstarts[i].x + 5 * othertile, optionsstarts[i].y + 5 * othertile)) {
			if (options[i] == null) {
				return;
			}
			pickedoption = i;
			pickedDrawing.x = optionsstarts[i].x + othertile * 2.5;
			pickedDrawing.y = optionsstarts[i].y + othertile * 2.5;

			xMouseOffset = calcFigureOffset(options[i]).x;
			yMouseOffset = calcFigureOffset(options[i]).y + constyMouseOffset;
		}
	}
}

function mouseReleased() {
	if (pickedoption == null) {
		return;
	}
	var option = options[pickedoption];
	var xindex = floor((mouseX - gridstart.x) / tile + xMouseOffset) - 2;
	var yindex = floor((mouseY - gridstart.y) / tile + yMouseOffset) - 2;
	indexes = [];
	for (var y = 0; y < 5; y++) {
		var yy = y + yindex;
		for (var x = 0; x < 5; x++) {
			var xx = x + xindex;
			if (option[y][x] == 1) {
				if (grid[yy] === undefined || grid[yy][xx] === undefined) {
					//console.log("Figure off grid");
					pickedoption = null;
					return;
				} else {
					if (grid[yy][xx] == 1) {
						//console.log("Place taken");
						pickedoption = null;
						return;
					}
					indexes.push({
						y: yy,
						x: xx
					});
				}
			}
		}
	}
	for (var i = 0; i < indexes.length; i++) {
		grid[indexes[i].y][indexes[i].x] = 1;
	}
	addPoints(indexes.length);
	options[pickedoption] = null;
	pickedoption = null;

	checkGrid();

	fillOptions();

	saveToLocalStorage("grid", grid);
	saveToLocalStorage("options", options);

	checkIfGameLost();

	saveToLocalStorage("options", options);
}

function checkIfGameLost() {
	if (options[0] == null && options[1] == null && options[2] == null) {
		fillOptions();
	}
	lost = false;
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		if (option == null) {
			continue;
		}

		for (var yy = -4; yy < gridsize; yy++) {
			for (var xx = -4; xx < gridsize; xx++) {

				var figureFitsHere = true;
				for (var y = 0; y < 5; y++) {
					yindex = yy + y;
					for (var x = 0; x < 5; x++) {
						xindex = xx + x;
						if (option[y][x] == 1) {
							if (grid[yindex] === undefined || grid[yindex][xindex] === undefined || grid[yindex][xindex] == 1) {
								y = x = 5;
								figureFitsHere = false;
								break;
							}
						}
					}
				}
				if (figureFitsHere) {
					return;
				}
			}
		}
	}
	endGame();
}

function endGame() {
	lost = true;
	$('#lostScoreSpan').text(points);
	$("#lostScreen").fadeIn('slow', 'swing', showInterstitial);
}

function mouseContained(x1, y1, x2, y2) {
	if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
		return true;
	} else {
		return false;
	}
}

function fillOptions() {
	if (options[0] == null && options[1] == null && options[2] == null) {
		for (var i = 0; i < options.length; i++) {
			options[i] = figures[floor(random(0, figures.length))].slice();
		}
	}
}

function drawGrid() {
	fill(rgba(40, 40, 40, 200));
	var drawY = gridstart.y;
	for (var y = 0; y < grid.length; y++) {
		var drawX = gridstart.x;
		for (var x = 0; x < grid[y].length; x++) {
			if (grid[y][x] == 1) {
				image(images.tile, drawX, drawY, tile, tile);
			}
			drawX += tile
		}
		drawY += tile;
	}
}

function drawGridBG() {
	var c = 39 / floor(borderWidth);
	for (var i = 0; i <= borderWidth; i++) {
		stroke(hsl(32, 19, 39 - i * c));
		beginShape();
		vertex(gridBorder.x + i, gridBorder.y + i);
		vertex(gridBorder.x + i + gridBorder.w - 2 * i, gridBorder.y + i);
		vertex(gridBorder.x + i + gridBorder.w - 2 * i, gridBorder.y + i + gridBorder.h - 2 * i);
		vertex(gridBorder.x + i, gridBorder.y + i + gridBorder.h - 2 * i);
		endShape();
	}
	image(images.gridBG, gridstart.x, gridstart.y, gridstart.w, gridstart.h);
}

function keyPressed(k) {
	if (k == 32) {
		options[0] = null;
		options[1] = null;
		options[2] = null;
		fillOptions();
	}
}

function drawOptions() {
	if (pickedoption != null) {
		pickedDrawing.x = lerp(pickedDrawing.x, mouseX + xMouseOffset * tile, pickedLerpRate);
		pickedDrawing.y = lerp(pickedDrawing.y, mouseY + yMouseOffset * tile, pickedLerpRate);
	}
	for (var i = 0; i < options.length; i++) {
		figure = options[i];
		if (figure == null) {
			continue;
		}
		var drawMY = pickedDrawing.y - tile * 2.5;
		var drawY = optionsstarts[i].y;
		for (var y = 0; y < figure.length; y++) {
			var drawMX = pickedDrawing.x - tile * 2.5;
			var drawX = optionsstarts[i].x;
			for (var x = 0; x < figure[y].length; x++) {
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

function calcFigureOffset(figure) {
	let yoffset = 0;
	let good = true;
	for (var y = 4; y >= 0; y--) {
		for (var x = 0; x < 5; x++) {
			if (figure[y][x] == 1) {
				good = false;
				break;
			}
		}
		if (!good) break;
		yoffset++;
	}

	let xOffsetLeft = 0;
	good = true;
	for (let x = 0; x < 5; x++) {
		for (var y = 0; y < 5; y++) {
			if (figure[y][x] == 1) {
				good = false;
				break;
			}
		}
		if (!good) break;
		xOffsetLeft++;
	}

	let xOffsetRight = 0;
	good = true;
	for (let x = 4; x >= 0; x--) {
		for (var y = 0; y < 5; y++) {
			if (figure[y][x] == 1) {
				good = false;
				break;
			}
		}
		if (!good) break;
		xOffsetRight++;
	}
	return {
		x: (xOffsetRight - xOffsetLeft) / 2,
		y: yoffset
	};
}

function drawOptionsBG() {
	drawOptionBackground(optionsstarts[0].x, optionsstarts[0].y);
	drawOptionBackground(optionsstarts[1].x, optionsstarts[1].y);
	drawOptionBackground(optionsstarts[2].x, optionsstarts[2].y);

	function drawOptionBackground(startx, starty) {
		var c = 0;
		var drawY = starty;
		for (var y = 0; y < 5; y++) {
			var drawX = startx;
			for (var x = 0; x < 5; x++) {
				if (c % 2) {
					fill(rgba(211, 209, 173, ));
				} else {
					fill(rgba(191, 189, 153));
				}
				var num = 0.1
				rect(drawX + othertile * num, drawY + othertile * num, othertile * (1 - num * 2), othertile * (1 - num * 2));
				c++;
				drawX += othertile;
			}
			drawY += othertile;
		}
	}
}

function drawLoadingAnimation() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// background(rgba(51,51,51));
	// textAlign("center");
	// push();
	// 	fill('white');
	// 	translate(width/2, height/2);
	// 	text("Loading...", 0, 0);
	// pop();
}

function drawPointsBaner() {
	image(images.pointsBg, pointsBaner.x, pointsBaner.y, pointsBaner.w, pointsBaner.h);
	font(pointsBaner.fontSize);
	fill('black');
	if (typeof botLoading != "undefined" && botLoading) {
		fill('blue');
	}
	textAlign("center");
	text(points, pointsBaner.textX, pointsBaner.textY);
}

function drawHighscoreBaner() {
	//image(images.pointsBg, highscoreBaner.x, highscoreBaner.y, highscoreBaner.w, highscoreBaner.h);
	image(images.crown, highscoreBaner.x - highscoreBaner.h / 1.2, highscoreBaner.y - gap / 7, highscoreBaner.h * 1.1, highscoreBaner.h * 1.1);
	font(highscoreBaner.fontSize);
	textAlign("center");
	fill('black');
	text(highscore, highscoreBaner.textX, highscoreBaner.textY);
}

function drawBackground() {
	image(images.bg, 0, 0, width, height);
}