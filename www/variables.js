const GRID_SIZE = 10;
const FIGURE_SIZE = 5;

let gap = 0;
let gapSmall = 0;
let OBW = 0; // option border width

let tileSize = 0,
    tileSizeSmall = 0;

const LERP = {
    ALPHA: 0.15,
    POS: 0.3,
    SIZE: 0.3,
    PLACE: 0.3,
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
let deadBoard = new Board();
let options = [
    new Option(),
    new Option(),
    new Option()
];

const TILE_LIFE = 20;
const TILE_ALPHA = 0.5

let gameLost = false;

let redrawOnce = true;

let pickedOption = null;

let score = 0,
    scoreDisplay = 0,
    highscore = 0;

let pause, bannerScore, bannerHighscore;

function setValues() {

    gap = width / 30;
    gapSmall = gap / 1.5;
    OBW = gapSmall / 2; // option border width

    tileSizeSmall = (width - gap - gap - gapSmall - gapSmall - 6 * OBW) / (FIGURE_SIZE * 3);

    // pause = new function () {
    //     this.w = (width - gap * 4) * 100 / 848;
    //     this.h = this.w;
    //     this.x = width - gap - this.w;
    //     this.y = gap;
    // }

    // bannerScore = new function () {
    //     this.h = pause.h;
    //     this.w = pause.h * 374 / 100;
    //     this.x = gap;
    //     this.y = gap;
    //     this.fontSize = floor(this.h * 0.95) + "px FontAwesome";
    //     this.textX = this.x + this.w / 2;
    //     this.textY = this.y + this.h * 0.83;
    // }

    // bannerHighscore = new function () {
    //     this.x = bannerScore.x + bannerScore.w + gap;
    //     this.y = bannerScore.y;
    //     this.w = bannerScore.w;
    //     this.h = bannerScore.h;
    //     this.fontSize = floor(this.h * 0.95) + "px FontAwesome";
    //     this.textX = this.x + this.w / 2;
    //     this.textY = this.y + this.h * 0.83;
    // }

    mainBoard.border = {
        x: gap,
        y: $('#scoreBar')[0].clientHeight + gap * 2.5,
        size: width - gap - gap,
        thickness: gapSmall / 2,
    };

    tileSize = (width - gap - gap - mainBoard.border.thickness * 2) / GRID_SIZE;

    mainBoard.tileSize = tileSize;

    mainBoard.x = mainBoard.border.x + mainBoard.border.thickness;
    mainBoard.y = mainBoard.border.y + mainBoard.border.thickness;
    mainBoard.w = tileSize * GRID_SIZE;
    mainBoard.h = mainBoard.w;

    deadBoard.x = mainBoard.x;
    deadBoard.y = mainBoard.y;
    deadBoard.tileSize = mainBoard.tileSize;

    options[0].init(gap, mainBoard.border.y + mainBoard.border.size + gapSmall, tileSizeSmall * FIGURE_SIZE + OBW + OBW, OBW);
    options[1].init(options[0].border.x + options[0].border.size + gapSmall, options[0].border.y, options[0].border.size, options[0].border.thickness);
    options[2].init(options[1].border.x + options[1].border.size + gapSmall, options[1].border.y, options[1].border.size, options[1].border.thickness);

    redrawOnce = true;
}