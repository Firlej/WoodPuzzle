class Option {
    constructor() {

        this.x = 0;
        this.y = 0;
        this.size = 0;

        this.callback = null;

        this.border = {
            x: 0,
            y: 0,
            size: 0,
            thickness: 0
        }

        this.alpha = 0;

        this.constX = 0;
        this.constY = 0;
        this.staticX = 0;
        this.staticY = 0;

        this.state = STATIC;

        this.grid = figures.random();

        this.board = {
            x: 0,
            y: 0,
            xpx: 0,
            ypx: 0
        }

        this.offset = {
            x: 0, // offset in tiles
            y: 0,
            xpx: 0, //offset in pixels
            ypx: 0,
            constX: 0, //-FIGURE_SIZE/2,
            constY: -4.5, // -FIGURE_SIZE/2,
        }

        this.tileCount = 0;

        this.refresh();
        this.setGrid(null);
    }

    refresh() {
        this.setGrid(figures.random());

        this.setState(STATIC);
        this.x = this.staticX;
        this.y = this.staticY;
        this.size = tileSizeSmall;

        this.alpha = 0;

        this.placed = false;
        this.board = {
            x: 0,
            y: 0,
            xpx: 0,
            ypx: 0
        };
        this.callback = null;
    }

    setGrid(grid) {
        this.setState(STATIC);
        this.grid = grid;
        this.calcOffset();
        this.calcTileCount();
    }

    init(_x, _y, _size, _thickness) {
        this.border = {
            x: _x,
            y: _y,
            size: _size,
            thickness: _thickness
        }
        this.constX = this.border.x + this.border.thickness;
        this.constY = this.border.y + this.border.thickness;

        this.staticX = this.constX;
        this.staticY = this.constY;
    }

    is(state) {
        return this.state === state;
    }

    setState(state) {
        this.state = state;
    }

    isNull() {
        return this.grid == null;
    }

    isAvailable() {
        return this.grid != null && (this.is(STATIC) || this.is(RETURNING));
    }

    pick() {
        this.setState(PICKED);

        this.x = this.staticX;
        this.y = this.staticY;
        this.size = tileSizeSmall;
    }

    placeOnBoard(board, x, y, callback) {
        this.setState(PLACED);
        this.board = {
            x: x,
            y: y,
            xpx: board.x + x * tileSize,
            ypx: board.y + y * tileSize
        }
        this.callback = callback;
    }

    draw() {
        if (!mainBoard.optionFitsOnGrid(this, true) && !this.is(PLACED)) {
            this.alpha = lerp(this.alpha, 0.5, LERP.ALPHA);
        } else {
            this.alpha = lerp(this.alpha, 1, LERP.ALPHA);
        }
        globalAlpha(this.alpha);

        if (this.is(PICKED)) {

            this.x = lerp(this.x, mouseX + this.offset.xpx, LERP.POS);
            this.y = lerp(this.y, mouseY + this.offset.ypx, LERP.POS);
            this.size = lerp(this.size, tileSize, LERP.SIZE);
            this.drawPicked();

        } else if (this.is(PLACED)) {

            if (abs(this.board.xpx - this.x) > LERP.DIST || abs(this.board.ypx - this.y) > LERP.DIST || abs(this.size - tileSize) > LERP.DIST) {
                this.x = lerp(this.x, this.board.xpx, LERP.PLACE);
                this.y = lerp(this.y, this.board.ypx, LERP.PLACE);
                this.size = lerp(this.size, tileSize, LERP.SIZE);
                this.drawPicked();
            } else {
                this.drawPicked();
                this.callback()
            }

        } else if (this.is(RETURNING)) {
            if (abs(this.staticX - this.x) > LERP.DIST || abs(this.staticY - this.y) > LERP.DIST || abs(this.size - tileSizeSmall) > LERP.DIST) {
                this.x = lerp(this.x, this.staticX, LERP.POS);
                this.y = lerp(this.y, this.staticY, LERP.POS);
                this.size = lerp(this.size, tileSizeSmall, LERP.SIZE);
                this.drawPicked();
            } else {
                this.drawPicked();
                this.setState(STATIC);
            }
        } else if (this.is(STATIC)) {
            this.drawStationary();
        }
        globalAlpha(1);
    }

    drawPicked() {
        if (this.grid != null) {
            let drawy = this.y;
            for (let y = 0; y < FIGURE_SIZE; y++) {
                let drawx = this.x;
                for (let x = 0; x < FIGURE_SIZE; x++) {
                    if (this.grid[y][x] == TAKEN) {
                        image(images.tile, drawx, drawy, this.size, this.size);
                    }
                    drawx += this.size;
                }
                drawy += this.size;
            }
        }
    }

    drawStationary() {
        if (this.grid != null) {
            let drawy = this.staticY;
            for (let y = 0; y < FIGURE_SIZE; y++) {
                let drawx = this.staticX;
                for (let x = 0; x < FIGURE_SIZE; x++) {
                    if (this.grid[y][x] == TAKEN) {
                        image(images.tile, drawx, drawy, tileSizeSmall, tileSizeSmall);
                    }
                    drawx += tileSizeSmall;
                }
                drawy += tileSizeSmall;
            }
        }
    }

    drawShadowOnBoard(board) {
        if (!this.isNull()) {
            if (this.is(PICKED)) {

                let xindex = floor((mouseX - board.x) / tileSize + this.offset.x) - 2;
                let yindex = floor((mouseY - board.y) / tileSize + this.offset.y) - 2;

                fill(rgba(1, 1, 1, 0.3));
                if (mainBoard.optionFitsInPos(this, xindex, yindex)) {
                    let drawy = mainBoard.y + yindex * tileSize;
                    for (let y = 0; y < FIGURE_SIZE; y++) {
                        let drawx = mainBoard.x + xindex * tileSize;
                        for (let x = 0; x < FIGURE_SIZE; x++) {
                            if (this.grid[y][x] == 1) {
                                rect(drawx, drawy, tileSize, tileSize);
                            }
                            drawx += tileSize;
                        }
                        drawy += tileSize;
                    }
                }
            }
        }

    }


    drawBackground() {

        let c = 39 / OBW;
        let baseX = this.border.x;
        let baseY = this.border.y;
        let baseSize = this.border.size;

        for (let i = 0; i <= this.border.thickness + 1; i++) {
            stroke(hsl(32, 19, 39 - i * c));
            beginShape();
            vertex(baseX, baseY);
            vertex(baseX + baseSize, baseY);
            vertex(baseX + baseSize, baseY + baseSize);
            vertex(baseX, baseY + baseSize);
            endShape();

            baseX++;
            baseY++;
            baseSize -= 2;
        }
        image(images.gridBG, this.constX, this.constY, tileSizeSmall * FIGURE_SIZE, tileSizeSmall * FIGURE_SIZE);
    }

    calcOffset() {
        this.offset.x = this.offset.constX;
        this.offset.y = this.offset.constY;

        if (!this.isNull()) {
            let offset = calcGridOffsets(this.grid);

            this.offset.y += offset.bottom;
            this.offset.x += (offset.right - offset.left) / 2;

            this.staticX = this.constX + (offset.right - offset.left) / 2 * tileSizeSmall;
            this.staticY = this.constY + (offset.bottom - offset.top) / 2 * tileSizeSmall;

            this.offset.xpx = (this.offset.x - 2.5) * tileSize;
            this.offset.ypx = (this.offset.y - 2.5) * tileSize;

            return {
                x: this.offset.x,
                y: this.offset.y
            };
        }


    }

    calcTileCount() {
        this.tileCount = 0;
        if (!this.isNull()) {
            for (var y = 0; y < FIGURE_SIZE; y++) {
                for (var x = 0; x < FIGURE_SIZE; x++) {
                    if (this.grid[y][x] == TAKEN) {
                        this.tileCount++;
                    }
                }
            }
        }
    }

    // calcSize() {
    //     this.w = 0;
    //     this.h = 0;
    //     if (this.grid != null) {
    //         for (let y = 0; y < FIGURE_SIZE; y++) {
    //             for (let x = 0; x < FIGURE_SIZE; x++) {
    //                 if (this.grid[y][x] == TAKEN) {
    //                     this.h++;
    //                     break;
    //                 }
    //             }
    //         }
    //         for (let x = 0; x < FIGURE_SIZE; x++) {
    //             for (let y = 0; y < FIGURE_SIZE; y++) {
    //                 if (this.grid[y][x] == TAKEN) {
    //                     this.w++;
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // }
}

function calcGridOffsets(grid) {
    let offset = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    let good = true;
    for (var y = FIGURE_SIZE - 1; y >= 0; y--) {
        for (var x = 0; x < FIGURE_SIZE; x++) {
            if (grid[y][x] == TAKEN) {
                good = false;
                break;
            }
        }
        if (!good) break;
        offset.bottom++;
    }

    good = true;
    for (let y = 0; y < FIGURE_SIZE; y++) {
        for (let x = 0; x < FIGURE_SIZE; x++) {
            if (grid[y][x] == TAKEN) {
                good = false;
                break;
            }
        }
        if (!good) break;
        offset.top++;
    }

    good = true;
    for (let x = 0; x < FIGURE_SIZE; x++) {
        for (var y = 0; y < FIGURE_SIZE; y++) {
            if (grid[y][x] == TAKEN) {
                good = false;
                break;
            }
        }
        if (!good) break;
        offset.left++;
    }

    good = true;
    for (let x = FIGURE_SIZE - 1; x >= 0; x--) {
        for (var y = 0; y < FIGURE_SIZE; y++) {
            if (grid[y][x] == TAKEN) {
                good = false;
                break;
            }
        }
        if (!good) break;
        offset.right++;
    }

    return offset;
}