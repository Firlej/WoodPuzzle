class Board {
    constructor() {

        this.grid = [];

        // VALUES
        // 0 - EMPTY
        // 1 - TAKEN
        // 2 - RESERVED FOR A CURRENTLY ANIMATED OPTION

        this.resetGrid();

        this.x = 0;
        this.y = 0;

        this.border = {
            x: 0,
            y: 0,
            size: 0,
            thickness: 0
        }

        this.tileSize = 0;
    }

    resetGrid() {
        let cleanGrid = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            cleanGrid[y] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                cleanGrid[y][x] = EMPTY;
            }
        }
        this.setGrid(cleanGrid);
    }

    setGrid(grid) {
        this.grid = grid;
    }

    lost(options) {
        for (let i = 0; i < options.length; i++) {
            if (!options[i].isNull()) {
                if (this.optionFitsOnGrid(options[i])) {
                    return false;
                }
            }
        }
        return true;
    }

    optionFitsOnGrid(option, reserved_ok = false) {
        for (let y = -4; y < GRID_SIZE; y++) {
            for (let x = -4; x < GRID_SIZE; x++) {
                if (this.optionFitsInPos(option, x, y, reserved_ok)) {
                    return true;
                }
            }
        }
        return false;
    }

    optionFitsInPos(option, posx, posy, reserved_ok = false) {
        if (!option.isNull()) {
            for (let y = 0; y < FIGURE_SIZE; y++) {
                for (let x = 0; x < FIGURE_SIZE; x++) {
                    if (option.grid[y][x] == TAKEN) {
                        if (this.grid[posy + y] === undefined || this.grid[posy + y][posx + x] === undefined) {
                            return false;
                        } else if (this.grid[posy + y][posx + x] != EMPTY) {
                            if (this.grid[posy + y][posx + x] != RESERVED || !reserved_ok) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }

    reserveSpot(option, posx, posy) {
        for (let y = 0; y < FIGURE_SIZE; y++) {
            for (let x = 0; x < FIGURE_SIZE; x++) {
                if (option.grid[y][x] == TAKEN) {
                    this.grid[posy + y][posx + x] = RESERVED;
                }
            }
        }
        return true;
    }

    placeOption(option, posx, posy) {
        for (let y = 0; y < FIGURE_SIZE; y++) {
            for (let x = 0; x < FIGURE_SIZE; x++) {
                if (option.grid[y][x] == TAKEN && this.grid[posy + y][posx + x] == RESERVED) {
                    this.grid[posy + y][posx + x] = TAKEN;
                }
            }
        }
        return true;
    }
    check() {
        let colsToRemove = [];
        let rowsToRemove = [];

        for (let y = 0; y < GRID_SIZE; y++) {
            let toRemove = true;
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.grid[y][x] != 1) {
                    toRemove = false;
                    break;
                }
            }
            if (toRemove) {
                rowsToRemove.push(y);
            }
        }

        for (let x = 0; x < GRID_SIZE; x++) {
            let toRemove = true;
            for (let y = 0; y < GRID_SIZE; y++) {
                if (this.grid[y][x] != 1) {
                    toRemove = false;
                    break;
                }
            }
            if (toRemove) {
                colsToRemove.push(x);
            }
        }

        for (let i = 0; i < colsToRemove.length; i++) {
            let x = colsToRemove[i];
            for (let y = 0; y < GRID_SIZE; y++) {
                this.grid[y][x] = 0;
            }
        }
        for (let i = 0; i < rowsToRemove.length; i++) {
            let y = rowsToRemove[i];
            for (let x = 0; x < GRID_SIZE; x++) {
                this.grid[y][x] = 0;
            }
        }

        return {
            cols: colsToRemove,
            rows: rowsToRemove,
            count: (colsToRemove.length + rowsToRemove.length)
        };
    }

    setCols(cols, value = TILE_LIFE) {
        for (let i = 0; i < cols.length; i++) {
            let x = cols[i];
            for (let y = 0; y < GRID_SIZE; y++) {
                this.grid[y][x] = value;
            }
        }
    }

    setRows(rows, value = TILE_LIFE) {
        for (let i = 0; i < rows.length; i++) {
            let y = rows[i];
            for (let x = 0; x < GRID_SIZE; x++) {
                this.grid[y][x] = value;
            }
        }
    }

    draw() {
        let drawY = this.y;
        fill(rgba(1, 1, 1, 0.3));
        for (let y = 0; y < GRID_SIZE; y++) {
            let drawX = this.x;
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.grid[y][x] == TAKEN) {
                    image(images.tile, drawX, drawY, this.tileSize, this.tileSize);
                } else if (this.grid[y][x] == RESERVED) {
                    rect(drawX, drawY, this.tileSize, this.tileSize);
                }
                drawX += this.tileSize;
            }
            drawY += this.tileSize;
        }
    }

    drawDead() {
        let drawY = this.y;
        for (let y = 0; y < GRID_SIZE; y++) {
            let drawX = this.x;
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.grid[y][x] > 0) {
                    let ratio = (this.grid[y][x] / TILE_LIFE) * (this.grid[y][x] / TILE_LIFE);
                    let offset = this.tileSize * (1 - ratio);
                    globalAlpha(ratio);
                    image(images.tile, drawX + offset / 2, drawY + offset / 2, this.tileSize * ratio, this.tileSize * ratio);
                    this.grid[y][x]--;
                    globalAlpha(1);
                }
                drawX += this.tileSize;
            }
            drawY += this.tileSize;
        }
    }

    drawBackground() {
        //todo optimise
        let c = 35 / floor(this.border.thickness);
        let baseX = this.border.x;
        let baseY = this.border.y;
        let baseSize = this.border.size;
        for (let i = 0; i <= this.border.thickness + 1; i++) {
            stroke(hsl(160, 0, 35 - i * c));
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
        image(images.grid, this.x, this.y, this.w, this.h);
    }
}