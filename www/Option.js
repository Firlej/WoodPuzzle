class Option {
    constructor() {

        this.x = 0;
        this.y = 0;
        this.size = 0;

        this.callback = null;

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
            constY: -5.5, // -FIGURE_SIZE/2,
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

    init(constX, constY) {
        this.constX = constX;
        this.constY = constY;

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
        // this.picked = true;
        this.setState(PICKED);

        this.x = this.staticX; // + FIGURE_SIZE / 2 * (tileSizeSmall - tileSize);
        this.y = this.staticY; // + FIGURE_SIZE / 2 * (tileSizeSmall - tileSize);
        this.size = tileSizeSmall;
    }

    release() {
        // if (this.is(PICKED)) {
        //     this.state = 
        // }
        // this.picked = false;
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

    // update() {

    // }

    // lerp(x, y, size) {
    //     this.x = lerp(this.x, x, LERP.POS);
    //     this.y = lerp(this.y, y, LERP.POS);
    //     this.size = lerp(this.size, size, LERP.SIZE);
    // }

    draw() {
        // if (!mainBoard.optionFitsOnGrid(this) && !this.is(PLACED)) {
        //     // todo fil while option is PLACED and took the only place for another available option
        //     // that other available option doesnt fit coz the place on grid is RESERVED
        //     globalAlpha(0.7);
        // }

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

        } else if (this.is(RETURNING)){

            if (abs(this.staticX - this.x) > LERP.DIST || abs(this.staticY - this.y) > LERP.DIST || abs(this.size - tileSizeSmall) > LERP.DIST) {
                // this.lerp(this.staticX, this.)
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
            } else if (this.is(PLACED)) {
                fill(rgba(1, 1, 1, 0.3));
                let drawy = this.board.ypx;
                for (let y = 0; y < FIGURE_SIZE; y++) {
                    let drawx = this.board.xpx;
                    for (let x = 0; x < FIGURE_SIZE; x++) {
                        if (this.grid[y][x] == TAKEN) {
                            rect(drawx, drawy, tileSize, tileSize);
                        }
                        drawx += tileSize;
                    }
                    drawy += tileSize;
                }
            }
        }
        
    }


    drawBackground() {
        var c = 0;
        let num = 0.1;
        // var drawY = this.staticY;
        var drawY = this.constY;
        for (var y = 0; y < FIGURE_SIZE; y++) {
            // var drawX = this.staticX;
            var drawX = this.constX;
            for (var x = 0; x < FIGURE_SIZE; x++) {
                if (c % 2) {
                    fill(rgba(211, 209, 173, 0.9));
                } else {
                    fill(rgba(191, 189, 153, 0.9));
                }
                rect(drawX + tileSizeSmall * num, drawY + tileSizeSmall * num, tileSizeSmall * (1 - num * 2), tileSizeSmall * (1 - num * 2));
                c++;
                drawX += tileSizeSmall;
            }
            drawY += tileSizeSmall;
        }
    }

    calcOffset() {
        this.offset.x = this.offset.constX;
        this.offset.y = this.offset.constY;

        if (!this.isNull()) {
            let offset = calcGridOffsets(this.grid);

            this.offset.y += offset.bottom;
            this.offset.x += (offset.right - offset.left) / 2;

            this.staticX = this.constX;
            this.staticY = this.constY;

            this.staticX += (offset.right - offset.left) / 2 * tileSizeSmall;
            this.staticY += (offset.bottom - offset.top) / 2 * tileSizeSmall;

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