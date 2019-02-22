const GRID_SIZE = 10;
const FIGURE_SIZE = 5;

let gap = 0;
let gapSmall = 0;

let tileSize = 0,
    tileSizeSmall = 0;

const LERP = {
    POS: 0.2,
    SIZE: 0.2,
    PLACE: 0.25,
    DIST: 0.499999,
    SCORE: 0.069
};

// OPTION STATES
const STATIC = 0,
    PICKED = 1,
    RETURNING = 2,
    PLACED = 3;


// GRID VALUES
const EMPTY = 0,
    TAKEN = 1,
    RESERVED = 2;

let mainBoard = new Board();
let options = [
    new Option(),
    new Option(),
    new Option()
];

let gameLost = false;

let redrawOnce = true;

let pickedOption = null;

let score = 0,
    scoreDisplay = 0,
    highscore = 0;

function setValues() {

    gap = width / 25;
    gapSmall = gap/2;

    tileSize = (width - gap - gap - gapSmall - gapSmall) / GRID_SIZE;
    mainBoard.tileSize = tileSize;
    tileSizeSmall = (width - gap - gap - gapSmall - gapSmall) / (FIGURE_SIZE * 3);

    bannerScore = new function () {
        this.w = (width - gap - gap) / 2.2;
        this.h = this.w * 160 / 512;
        this.x = gap;
        this.y = gap;
        this.fontSize = floor(this.h * 0.95) + "px FontAwesome";
        this.textX = floor(this.x + this.w / 2);
        this.textY = floor(this.y + this.h * 0.83);
    }

    bannerHighscore = new function () {
        // todo this.x
        this.x = bannerScore.x + bannerScore.w + (width - gap / 2 - 2 * bannerScore.w);
        this.y = bannerScore.y;
        this.w = bannerScore.w;
        this.h = bannerScore.h;
        this.fontSize = floor(this.h * 0.95) + "px FontAwesome";
        this.textX = this.x + this.w / 2;
        this.textY = this.y + this.h * 0.83;
    }

    mainBoard.border = {
        x: gap,
        y: bannerScore.y + bannerScore.h + gap * 2,
        size: width - gap - gap,
        thickness: gapSmall,
    };

    mainBoard.x = mainBoard.border.x + gapSmall;
    mainBoard.y = mainBoard.border.y + gapSmall;
    mainBoard.w = tileSize * GRID_SIZE;
    mainBoard.h = mainBoard.w;

    options[0].init(gap, mainBoard.border.y + mainBoard.border.size + 2 * gap);
    options[1].init(options[0].constX + tileSizeSmall * FIGURE_SIZE + gapSmall, options[0].constY);
    options[2].init(options[1].constX + tileSizeSmall * FIGURE_SIZE + gapSmall, options[1].constY);

	redrawOnce = true;
}