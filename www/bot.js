
document.onkeydown = function(evt) {
    evt = evt || window.event;;
    if (evt.keyCode == 66 && gameReady) {
        botDraw();
    }
};
var botLoading = false;

var originalGrid;
var tempGrid;
var possiblePlacements;
var possibilitiesCombined = [];

var bestOption;

function botDraw() {
    botLoading = true;
    lookForPossibilities();
    //console.log(possiblePlacements);
    getScores();

    possibilitiesCombined = [];
    for(var i=0; i<3; i++) {
        for(var j=0; j<possiblePlacements[i].length; j++){
            possibilitiesCombined.push(possiblePlacements[i][j]);
        }
    }

    possibilitiesCombined.sort(function(a, b) {
        if (a.lostAfter && !b.lostAfter) { return 1; }
        if (!a.lostAfter && b.lostAfter) { return -1; }

        if (a.pointsAdded > b.pointsAdded) { return -1; }
        if (a.pointsAdded < b.pointsAdded) { return 1; }

        if (a.edgesCount < b.edgesCount) { return -1; }
        if (a.edgesCount > b.edgesCount) { return 1; }

        return 0;
    });

    console.log(possibilitiesCombined);
    placeOption(possibilitiesCombined[0].i, possibilitiesCombined[0].x, possibilitiesCombined[0].y);
    botLoading = false;
}

function getScores() {
    originalGrid = copyGrid(grid);
    for(var i=0; i<possiblePlacements.length; i++) {
        optionPossibilities = possiblePlacements[i];
        for (var j=0; j<optionPossibilities.length; j++) {
            possibility = optionPossibilities[j];
            originalGrid = copyGrid(grid);
            possiblePlacements[i][j] = getScore(i, possibility.x, possibility.y);
        }
    }
}

function getScore(i, x, y) {
    tempGrid = copyGrid(originalGrid);
    var result = putOnGrid(i, x, y);
    return result;
}

function putOnGrid(_i, _x, _y) {
	var option = options[_i];
	var xindex = _x;
	var yindex = _y;
	indexes = [];
	for(var y=0; y<5; y++) {
		var yy = y+yindex;
		for(var x=0; x<5; x++) {
			var xx = x+xindex;
			if (option[y][x]==1) {
				if (tempGrid[yy]===undefined || tempGrid[yy][xx]===undefined) {
					return;
				} else {
					if (tempGrid[yy][xx] == 1) {
						return;
					}
					indexes.push({y: yy, x: xx});
				}
			}
		}
	}
	for(var i=0; i<indexes.length; i++) {
		tempGrid[indexes[i].y][indexes[i].x] = 1;
    }

    // BEGIN CHECKGRID
        var colsToRemove = [];
        var rowsToRemove = [];
        for(var y=0; y<gridsize; y++) {
            var toRemove = true;
            for(var x=0; x<gridsize; x++) {
                if (tempGrid[y][x]!=1) { toRemove=false; break; }
            }
            if (toRemove) {
                rowsToRemove.push(y);
            }
        }
        for(var x=0; x<gridsize; x++) {
            var toRemove = true;
            for(var y=0; y<gridsize; y++) {
                if (tempGrid[y][x]!=1) { toRemove=false; break; }
            }
            if (toRemove) {
                colsToRemove.push(x);	
            }
        }
        for(var i=0; i<colsToRemove.length; i++) {
            var x = colsToRemove[i];
            for(var j=0; j<gridsize; j++) {
                tempGrid[j][x] = 0;
            }
        }
        for(var i=0; i<rowsToRemove.length; i++) {
            var y = rowsToRemove[i];
            for(var j=0; j<gridsize; j++) {
                tempGrid[y][j] = 0;
            }
        }
    // END CHECKGRID

    // BEGIN CHECK IF LOST
    var lost = true;
	if(options[0]==null && options[1]==null && options[2]==null) {
		lost = false;
	} else {
        for (var i=0; i<options.length; i++) {
            var option = options[i];
            if(option==null || i == _i) { continue; }
            
            for(var yy=-4; yy<gridsize; yy++) {
                for(var xx=-4; xx<gridsize; xx++) {
    
                    var figureFitsHere = true;
                    for(var y=0; y<5; y++) {
                        yindex = yy+y;
                        for(var x=0; x<5; x++) {
                            xindex = xx + x;
                            if (option[y][x]==1) {
                                if (tempGrid[yindex]===undefined || tempGrid[yindex][xindex]===undefined || tempGrid[yindex][xindex] == 1) {
                                    y=x=5;
                                    figureFitsHere = false;
                                    break;
                                }
                            }
                        }
                    }
                    if(figureFitsHere) {
                        lost = false;
                        xx = gridsize;
                        yy = gridsize;
                        i = options.length;
                    }
                }
            }
        }
    }
    // END CHECK IF LOST

    var edgesCount = 0;
    var zedges = [];
    for(var y=0; y<gridsize; y++) {
        for(var x=0; x<gridsize; x++) {
            if (tempGrid[y][x] == 0) {
                // if(state(y-1, x)) { zedges.push({ 1: {x: x, y: y}, 2: {x: x, y: y-1} }) }
                // if(state(y+1, x)) { zedges.push({ 1: {x: x, y: y}, 2: {x: x, y: y+1} }) }
                // if(state(y, x-1)) { zedges.push({ 1: {x: x, y: y}, 2: {x: x-1, y: y} }) }
                // if(state(y, x+1)) { zedges.push({ 1: {x: x, y: y}, 2: {x: x+1, y: y} }) }
                state(y-1, x);
                state(y+1, x);
                state(y, x-1);
                state(y, x+1);
            }
        }
    }
    function state(yyy, xxx) {
        if (yyy>=0 && yyy<gridsize && xxx>=0 && xxx<gridsize && tempGrid[yyy][xxx] === 1) {
            edgesCount++;
            return true;
        }
        return false;
    }

    return {
        i: _i,
        x: _x,
        y: _y,
        edgesCount: edgesCount,
        pointsAdded: indexes.length + (colsToRemove.length+rowsToRemove.length)*gridsize,
        gridAfter: copyGrid(tempGrid),
        lostAfter: lost
    }
}


function placeOption(optionID, x, y) {
    pickedoption = optionID;
    mouseX = gridstart.x + (x+2)*tile + 1;
    mouseY = gridstart.y + (y+2-yMouseOffset)*tile + 1 ;
    mouseReleased();
}


function lookForPossibilities() {
    possiblePlacements = [];
    possiblePlacements[0] = [];
    possiblePlacements[1] = [];
    possiblePlacements[2] = [];
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
					possiblePlacements[i].push({
                        x: xx,
                        y: yy
                    })
				}
			}
		}
	}
}

function copyGrid(g) {
    var tempGrid = [];
	for(var y=0; y<gridsize; y++) {
		tempGrid[y] = [];
		for(var x=0; x<gridsize; x++) {
			tempGrid[y][x] = g[y][x];
		}
    }
    return tempGrid;
}