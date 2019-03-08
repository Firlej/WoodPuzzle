sources = {
	grid: 'img/grid.png',
	gridBG: 'img/gridbg.jpg',
	tile: 'img/tile.jpg',
	pointsBg: 'img/baner.jpg',
	crown: 'img/crown.png',
}

function imagesLoaded() {
	// $("#cover").hide();
	// $("#startScreen").fadeIn('fast');
}

function setup(callback) {
	loadImages(sources);

	setValues();

	windowResized();

	beginGame();
	getAllLocalStorage();

	callback();

	redrawOnce = true;
}

function draw() {

	if (gameIsStatic() && frameCount > 6000) {
		return;
	}

	drawBackground();

	drawBannerScore();
	drawBannerHighscore();

	mainBoard.drawBackground();
	mainBoard.draw();

	deadBoard.drawDead();

	drawOptions();
}

function gameIsStatic() {
	if (redrawOnce) {
		redrawOnce = false;
		return false;
	}

	if (
		scoreDisplay != score ||
		pickedOption != null ||
		!options[0].is(STATIC) ||
		!options[1].is(STATIC) ||
		!options[2].is(STATIC)
	) {
		return false;
	} else {
		return true;
	}
}

function windowResized() {
	let widthToHeight = 9 / 16;

	let gameArea = document.getElementById('gameArea');

	let newWidth = windowWidth;
	let newHeight = windowHeight;
	let newWidthToHeight = newWidth / newHeight;

	let fontSize = 12;
	let lostScoreSpanHeight = 24.3;

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

	gameArea.style.marginTop = (-newHeight / 2) + 'px';
	gameArea.style.marginLeft = (-newWidth / 2) + 'px';

	resizeCanvas($('#gameArea').width(), $('#gameArea').height());
	setValues();
}

function beginGame() {
	redrawOnce = true;
	gameLost = false;
	mainBoard.resetGrid();
	options[0].setGrid(null);
	options[1].setGrid(null);
	options[2].setGrid(null);
	score = 0;
	highscore = 0;
}

function getAllLocalStorage() {
	highscore = localStorage.hasKey('highscore') ? localStorage.getParsed('highscore') : 0;

	score = localStorage.hasKey('points') ? localStorage.getParsed('points') : 0; // todo to be removed. used in v 1.4.3
	score = localStorage.hasKey('score') ? localStorage.getParsed('score') : score;
	scoreDisplay = score;

	if (localStorage.hasKey('grid')) {
		mainBoard.setGrid(localStorage.getParsed('grid'));
	}

	if (localStorage.hasKey('options')) {
		let tempGrids = localStorage.getParsed('options');
		options[0].setGrid(tempGrids[0]);
		options[1].setGrid(tempGrids[1]);
		options[2].setGrid(tempGrids[2]);
	} else {
		options[0].setGrid(null);
		options[1].setGrid(null);
		options[2].setGrid(null);
		fillOptions();
	}
	redrawOnce = true;
}

function saveToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function saveOptionsToLocalStorage() {
	let optionGrids = [];
	for (let i = 0; i < options.length; i++) {
		optionGrids.push(options[i].grid);
	}
	saveToLocalStorage('options', optionGrids);
}

function resetGame() {
	redrawOnce = true;
	gameLost = false;
	mainBoard.resetGrid();
	options[0].setGrid(null);
	options[1].setGrid(null);
	options[2].setGrid(null);
	fillOptions();
	score = 0;
}

function saveCurrentState() {
	saveToLocalStorage("grid", mainBoard.grid);
	saveOptionsToLocalStorage();
	saveToLocalStorage("points", score); // todo to be removed in future versions. Used in v 1.4.3
	saveToLocalStorage("score", score);
	saveToLocalStorage("highscore", highscore);
}

function addScore(amount) {
	score += amount;
	if (score > highscore) {
		highscore = score;
	}
	saveToLocalStorage("points", score); // todo to be removed in future versions. Used in v 1.4.3
	saveToLocalStorage("score", score);
	saveToLocalStorage("highscore", highscore);
}

function mousePressed() {
	if (!(pickedOption instanceof Option) && !gameLost) {
		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			if (option.isAvailable() && mouseContained(
					option.border.x,
					option.border.y,
					option.border.x + option.border.size,
					option.border.y + option.border.size
				)) {
				option.pick();
				pickedOption = option;
			}
		}
	}
}

function mouseReleased() {
	if (pickedOption && pickedOption.is(PICKED)) {

		let x = floor((mouseX - mainBoard.x) / tileSize + pickedOption.offset.x) - 2;
		let y = floor((mouseY - mainBoard.y) / tileSize + pickedOption.offset.y) - 2;

		if (mainBoard.optionFitsInPos(pickedOption, x, y)) {

			mainBoard.reserveSpot(pickedOption, x, y);

			pickedOption.placeOnBoard(mainBoard, x, y, function () {
				mainBoard.placeOption(this, this.board.x, this.board.y);
				addScore(this.tileCount);
				let result = mainBoard.check();
				deadBoard.setCols(result.cols, TILE_LIFE);
				deadBoard.setRows(result.rows, TILE_LIFE);
				addScore(result.count * GRID_SIZE);
				this.setGrid(null);
				fillOptions();
				saveToLocalStorage("grid", mainBoard.grid);
				saveOptionsToLocalStorage();
				checkIfGameLost();
			});
		} else {
			pickedOption.setState(RETURNING);
		}
	}
	pickedOption = null;
}

function checkIfGameLost() {
	if (mainBoard.lost(options)) {
		if (pickedOption && pickedOption.is(PICKED)) {
			pickedOption.setState(RETURNING)
		}
		gameLost = true;
		endGame();
	}
}

function endGame() {
	$('#lostScoreSpan').text(score);
	$("#lostScreen").fadeIn('slow', 'swing', showInterstitial);
}

function fillOptions() {
	if (options[0].isNull() && options[1].isNull() && options[2].isNull()) {
		for (let i = 0; i < options.length; i++) {
			options[i].refresh();
		}
		saveOptionsToLocalStorage();
	}
}

// function keyPressed(k) {
// 	console.log(k);
// 	if (k == 32) {
// 		options[0].setGrid(null);
// 		options[1].setGrid(null);
// 		options[2].setGrid(null);
// 		fillOptions();
// 	} else if (k == 102) {
// 		mainBoard.setGrid([
// 			[0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
// 			[1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
// 			[1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
// 			[1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
// 			[1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
// 			[1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
// 			[1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
// 			[1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
// 			[1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
// 			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
// 		]);
// 		options[0].setGrid(figures[0]);
// 		options[1].setGrid(figures[0]);
// 		options[2].setGrid(figures[0]);
// 	}
// 	redrawOnce = true;
// }

function drawOptions() {
	for (let i = 0; i < options.length; i++) {
		options[i].drawBackground();
	}
	for (let i = 0; i < options.length; i++) {
		options[i].drawShadowOnBoard(mainBoard);
		options[i].draw();
	}
}

function drawBannerScore() {
	image(images.pointsBg, bannerScore.x, bannerScore.y, bannerScore.w, bannerScore.h);
	font(bannerScore.fontSize);
	fill('black');
	textAlign("center");

	if (abs(score - scoreDisplay) > LERP.DIST) {
		scoreDisplay = lerp(scoreDisplay, score, LERP.SCORE);
	} else {
		scoreDisplay = score;
	}

	text(floor(scoreDisplay), bannerScore.textX, bannerScore.textY);
}

function drawBannerHighscore() {
	// image(images.pointsBg, bannerHighscore.x, bannerHighscore.y, bannerHighscore.w, bannerHighscore.h);
	image(images.crown, bannerHighscore.x - bannerHighscore.h / 1.2, bannerHighscore.y - gap / 7, bannerHighscore.h * 1.1, bannerHighscore.h * 1.1);
	font(bannerHighscore.fontSize);
	textAlign("center");
	fill('black');
	text(highscore, bannerHighscore.textX, bannerHighscore.textY);
}

function drawBackground() {
	clearBackground();
	// rect(0, 0, width, height);
}