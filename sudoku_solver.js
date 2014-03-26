var SudokuPuzzle = function(cellValues) {
  if ( typeof cellValues === 'undefined' ) {
    var cellValues = [];
    var i = 0;
    for (i = 0; i < 9; i++) {
      var row = [0,0,0,0,0,0,0,0,0];
      cellValues.push(row);
    }
  }
  this.cells = cellValues;
}

var SudokuSolver = function() {
  var that = this;

  this.solve = function(puzzle) {
    var work_cells;
    var candidates;
    var empty_cells = 0;
    var candidates_count = 0;
    var new_count = -1;
    if (typeof puzzle == 'undefined') {
      return null;
    }
    work_cells = puzzle.cells.slice(); // copy the puzzle to a working array for safety.
    empty_cells = count_empty_cells(work_cells);
    while(candidates_count != new_count) {
      if(candidates_count != new_count) {
        candidates = find_candidates(work_cells);
        candidates_count = count(candidates);
        put_lone_candidates(work_cells, candidates);
        work_cells = traverse_trough_blocks(work_cells, put_block_unique_candidates);
        new_count = count(candidates);
      }
      if (candidates_count == new_count) {
        work_cells = traverse_trough_blocks(work_cells, this.regard_locked_pairs);
        new_count = count(candidates);
      }
      console.log("candidates count:" + new_count);
    }
    // if (count_empty_cells(work_cells) == 0) {
      puzzle.cells = work_cells;
    //} else {
    //  return null;
    //}

    return puzzle;
  }

  var count_empty_cells = function(cells) {
    var i = 0; // row index
    var j = 0; // column index
    var count = 0;

    for (i = 0; i < 9; i++) {
      for (j = 0; j < 9; j++) {
        if (cells[i][j] == 0) {
          count++;
        }
      }
    }
    return count;
  }

  // checks if a number is eligible candidate and if so adds id to a 3-dimensional array
  var find_candidates = function(cells) {
    var i = 0;
    var j = 0;
    var n = 0; // current probable candidate
    var cand = [];
    for (i=0;i<9;i++) {
      cand[i] = [];
      for (j=0;j<9;j++) {
        cand[i][j] = [];
        if (cells[i][j] != 0) {
          continue;
        } else {
          for (n=1; n<=9; n++) {
            if (is_eligible(n, i, j, cells)) {
              cand[i][j].push(n);
            }
          }
        }
      }
    }
    return cand;
  }

  // checks if n complies to the rules of sudoku for cell (i,j) from cells
  var is_eligible = function(n, i, j, cells) {
    var k = 0; // variable cell index
    var m = i - (i%3); // top row of the current square.
    var l = j - (j%3); // left column of the current sqare.
    var square_row = 0;
    var square_col = 0;
    for (k = 0; k < 9; k++) {
      if (k != j) {
        if (cells[i][k] === n) {
          return false;
        }
      }
      if (k != i) {
        if (cells[k][j] === n) {
          return false;
        }
      }
      square_row = m + Math.floor((k/3));
      square_col = l + (k%3);
      if (square_row != i || square_col != j) {
        if (cells[square_row][square_col] === n) {
          return false;
        }
      }
    }

    return true;
  }

  var count = function(cand) {
    var i = 0;
    var j = 0;
    var count = 0;

    for (i=0; i < 9; i++) {
      for (j=0;j<9; j++) {
        count += cand[i][j].length;
      }
    }
    return count;
  }

  /* checks if there are solitary candidates for a cell. If true, the candidate
   * is written to the cell and is popped out of the candidates array.
   * The operation is performed for every empty cell in cells
   */
  var put_lone_candidates = function(cells, candidates) {
    var i = 0; // current row
    var j = 0; // current column

    for (i = 0; i < 9; i += 1) {
      for (j = 0; j < 9; j += 1) {
        if (cells[i][j] === 0) {
          if (candidates[i][j].length == 1) {
            cells[i][j] = candidates[i][j].pop();
          }
        }
      }
    }
  }

  /*
   * sets the cells with candidates unpresent anywhere else
   * in the row, column or sqare.
   *
   * callback should take the following arguments:
   *  * i - a coordinate of the block: row number, column number or square number.
   *  * cells - the 2D array representing the sudoku puzzle
   *  * candidates - the candidates for every cell - 3D array
   *  * callback - the function that calculates the cell coordinates 
   *                for column and square
   */
  var traverse_trough_blocks = function(cells, callback) {
    var i = 0;
    var j = 0;
    var m = 0; // square x coordinate
    var l = 0; // square y coordinate
    var candidates = find_candidates(cells);
    for (i = 0; i < 9; i += 1) {
      //rows
      candidates = callback(i,cells,candidates, function(cand, r, c) {
        return [cand[r][c], [r, c]];
      });
      //columns
      candidates = callback(i,cells,candidates, function(cand, r, c) {
        return [cand[c][r], [c, r]];
      });
      //squares
      candidates = callback(i,cells,candidates, function(cand, r, c) {
        var m = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        var l = (r % 3 ) * 3 + (c % 3);
        return [cand[m][l], [m, l]];
      });
    }
    return cells;
  }

  var put_block_unique_candidates = function(i, cells, cand, callback) {
    var r, c;
    var block_candidates = find_cand_coords_by_value(cand, i, callback);
    for (j = 0; j < 9; j += 1) {
      if (block_candidates[j].length === 1) {
        r = block_candidates[j][0][0];
        c = block_candidates[j][0][1];
        cells[block_candidates[j][0][0]][block_candidates[j][0][1]] = j + 1;
        remove_candidates(cand, j + 1, r, c);
      }
    }
    return cand;
  }

  var remove_candidates = function(candidates, num, r, c) {
    remove_block_candidates(candidates, num, r, c, function(i, j, k) {
      return [i,k];
    });
    remove_block_candidates(candidates, num, r, c, function(i, j, k) {
      return [k,j];
    });
    remove_block_candidates(candidates, num, r, c, function(i, j, k) {
      var m = Math.floor(i / 3) * 3 + Math.floor(k / 3);
      var l = Math.floor(j / 3) * 3 + (k % 3);
      return [m, l];
    });
  }

  var remove_block_candidates = function(candidates, num, r, c, callback) {
    var j = 0;
    var crds;
    for (j = 0; j < 9; j += 1) {
      crds = callback(r, c, j);
      candidates[crds[0]][crds[1]] = candidates[crds[0]][crds[1]].filter(function(e,i,a) {
        return e !== num || _.isEqual(crds, [r,c]);
      }, this);
    }
  }

  /*
   * puts the coordinates of the cells with candidates with given value
   */
  var find_cand_coords_by_value = function(cand, i, callback) {
    var cellCandidatesInfo;
    var block_candidates = [[],[],[],[],[],[],[],[],[]];
    for (j = 0; j < 9; j += 1) {
      cellCandidatesInfo = callback(cand, i, j);
      cellCandidatesInfo[0].forEach(function(element, index, array) {
        if (i === 4) {
          window.alert(element);
        }
        block_candidates[element - 1].push(cellCandidatesInfo[1]);
      }, this);
    }
    return block_candidates;
  }

  /*
   * finds locked pairs and removes them from the appropriate block
   *
   * callback should take:
   * * cand - the candidates for every cell
   * * i, j - the coordinate arguments - used to calculate the exact coords
   *
   * it should return:
   * * an array with the value of the candidate for a given cell and its coords
   * format of return value: [ [c1, c2, c3...], [row, column] ]
   */
  this.regard_locked_pairs = function(i, cells, cand, callback) {
    var j, k;
    var cell;
    var other;
    var pair_candidates = [];
    console.log("the regard_locked_pairs function gets invoked");
    for (j = 0; j < 9; j += 1) {
      cell = callback(cand, i, j);
      if (cell[0].length >= 2) {
        for(k = 0; k < 9; k += 1) {
          other = callback(cand, i, k);
          if (other[0].length === cell[0].length) {
            if (_.isEqual(cell[0], other[0])) {
              pair_candidates.push(other[1]);
            }
          } else {
            continue;
          }
        }
      }
      if (pair_candidates.length === cell[0].length) {
        console.log("There are some pairs or triplets!");
        remove_candidates_from_block(cand, i, cell[0], pair_candidates, function(i, j) {
          return callback(cand, i, j)[1];
        });
      }
    }

    return cand;
  }

  /*
   * removes every candidate with number num from the cells in the block defined
   * by i and callback except the cells in pc.
   */
  var remove_candidates_from_block = function(candidates, i, num, pc, callback) {
    var coords;
    var j;
    for (j = 0; j < 9; j += 1) {
      coords = callback(i, j);
      if (pc.indexOf(coords) === -1) {
        candidates[coords[0]][coords[1]] = candidates[coords[0]][coords[1]].filter(function(e,i,a) {
          return num.indexOf(e) === -1;
        }, this);
      }
    }
    console.log("candidates are being removed!");
  }

  /*
   * takes arrays x and y and returns the elements 
   * that are present in both arrays
   */
  var intersect_arrays = function (x, y) {
    var ret = [];
    for (var i = 0; i < x.length; i++) {
      for (var z = 0; z < y.length; z++) {
        if (_.isEqual(x[i], y[j])) {
          ret.push(x[i]);
          break;
        }
      }
    }
    return ret;    
  }
}
















