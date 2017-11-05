
document.onkeydown = function(evt) {
    evt = evt || window.event;;
    if (evt.keyCode == 66 && gameReady) {
        botLoading = true;
        botDraw();
    }
};
var botLoading = false;

var possiblePlacements;
var possibilitiesCombined = [];

var bestOption;

function botDraw() {
    possiblePlacements = lookForPossibilities(grid, options);
    
    for(var i=0; i<possiblePlacements.length; i++) {
        var p = possiblePlacements[i];
        possiblePlacements[i] = putOnGrid(p.i, p.x, p.y, grid, options);
    }
    // console.log("Part 1 done!");

    // for(var i=0; i<possiblePlacements.length; i++) {

    //     var tempGrid = copyGrid(possiblePlacements[i].gridAfter);
    //     var tempOptions = copyOptions(possiblePlacements[i].optionsAfter);

    //     if(tempOptions[0]==null && tempOptions[1]==null && tempOptions[2]==null) {
    //         continue;
    //     }

    //     possiblePlacements[i].next = new function() {
    //         this.possiblePlacements = lookForPossibilities(tempGrid, tempOptions);
    //         for (var j=0; j<this.possiblePlacements.length; j++) {
    //             var p = this.possiblePlacements[j];
    //             this.possiblePlacements[j] = putOnGrid(p.i, p.x, p.y, tempGrid, tempOptions);
    //         }
    //     }
    // }

    // console.log("Part 2 done!");

    // var iterations = 0;

    // for(var i=0; i<possiblePlacements.length; i++) {
    //     if (!possiblePlacements[i].next) { continue; }
    //     for(var j=0; j<possiblePlacements[i].next.possiblePlacements.length; j++) {
    //         var p = possiblePlacements[i].next.possiblePlacements[j];
            
    //         var tempGrid = copyGrid(p.gridAfter);
    //         var tempOptions = copyOptions(p.optionsAfter);

    //         if(tempOptions[0]==null && tempOptions[1]==null && tempOptions[2]==null) {
    //             continue;
    //         }
    //         possiblePlacements[i].next.possiblePlacements[j].next = new function() {
    //             this.possiblePlacements = lookForPossibilities(tempGrid, tempOptions);
    //             for (var h=0; h<this.possiblePlacements.length; h++) {
    //                 var pp = this.possiblePlacements[h];
    //                 iterations ++;
    //                 //this.possiblePlacements[h] = putOnGrid(pp.i, pp.x, pp.y, tempGrid, tempOptions);
    //             }
    //         }
    //     }
    //     console.log("Part 3 progress: " + i + "/" +possiblePlacements.length);
    // }
    
    // console.log(iterations);
    // console.log("Part 3 done!");

    possiblePlacements.sort(function(a, b) {
        if (a.lostAfter && !b.lostAfter) { return 1; }
        if (!a.lostAfter && b.lostAfter) { return -1; }

        if (a.pointsAdded > b.pointsAdded) { return -1; }
        if (a.pointsAdded < b.pointsAdded) { return 1; }

        if (a.edgesCount < b.edgesCount) { return -1; }
        if (a.edgesCount > b.edgesCount) { return 1; }

        return 0;
    });

    // var allMoveSets = [];
    // pp1 = possiblePlacements;
    // console.log(pp1);
    
    // for(var i=0; i<pp1.length; i++) {
    //     var pp2 = pp1[i].next.possiblePlacements;
    //     console.log(pp2.length);
    //     for(var j=0; j<pp2.length; j++) {
    //         if (pp2[j].next == undefined) {
    //             continue;
    //         }
    //         pp3 = pp2[j].next.possiblePlacements;
    //         for(var h=0; h<pp3.length; h++) {
    //             console.log(pp1[i], pp2[j], pp3[h]);
    //         }
    //     }
    // }

    console.log(possiblePlacements);
    if (possiblePlacements[0] != undefined) {
        placeOption(possiblePlacements[0].i, possiblePlacements[0].x, possiblePlacements[0].y);
        // var possibility = possiblePlacements[0].next.possiblePlacements[0];
        // console.log(possiblePlacements[0].next.possiblePlacements);
        // setTimeout(function() {
        //     placeOption(possibility.i, possibility.x, possibility.y);
        // },500);
        
    }
    
    botLoading = false;
}

function putOnGrid(_i, _x, _y, _grid, _options) {
    var tempGrid = copyGrid(_grid);
    var tempOptions = copyOptions(_options);
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
    tempOptions[_i] = null;

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
	if(tempOptions[0]==null && tempOptions[1]==null && tempOptions[2]==null) {
		lost = false;
	} else {
        for (var i=0; i<tempOptions.length; i++) {
            var option = tempOptions[i];
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
    for(var y=0; y<gridsize; y++) {
        for(var x=0; x<gridsize; x++) {
            if (tempGrid[y][x] == 0) {
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
    return new function() {
        this.i = _i;
        this.x = _x;
        this.y = _y;
        this.edgesCount = edgesCount;
        this.pointsAdded = indexes.length + (colsToRemove.length+rowsToRemove.length)*gridsize;
        this.gridAfter = copyGrid(tempGrid);
        this.optionsAfter = copyOptions(tempOptions);
        this.lostAfter = lost;
    }
}

function placeOption(optionID, x, y) {
    pickedoption = optionID;
    mouseX = gridstart.x + (x+2)*tile + 1;
    mouseY = gridstart.y + (y+2-yMouseOffset)*tile + 1 ;
    mouseReleased();
}


function lookForPossibilities(g, o) { // grid , options
    var t = [];
	for (var i=0; i<o.length; i++) {
		var option = o[i];
		if(option==null) { continue; }
		
		for(var yy=-4; yy<gridsize; yy++) {
			for(var xx=-4; xx<gridsize; xx++) {

				var figureFitsHere = true;
				for(var y=0; y<5; y++) {
					yindex = yy+y;
					for(var x=0; x<5; x++) {
						xindex = xx + x;
						if (option[y][x]==1) {
							if (g[yindex]===undefined || g[yindex][xindex]===undefined || g[yindex][xindex] == 1) {
								y=x=5;
								figureFitsHere = false;
								break;
							}
						}
					}
				}
				if(figureFitsHere) {
					t.push({
                        i: i,
                        x: xx,
                        y: yy
                    })
				}
			}
		}
    }
    return t;
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

function copyOptions(o) {
    var t = []
    for(var i=0; i<3; i++) {
        if (o[i]==null) { continue; }
        t[i] = [];
        for(var y=0; y<5; y++) {
            t[i][y] = []
            for(var x=0; x<5; x++) {
                t[i][y][x] = o[i][y][x];
            }
        }
    }
    return t;
}