var SudokuPuzzle = function (cellValues) {
  "use strict";
  var i = 0, row;
  if (cellValues === undefined) {
    cellValues = [];
    for (i = 0; i < 9; i += 1) {
      row = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      cellValues.push(row);
    }
  }
  this.cells = cellValues;
};
var SudokuSolver = function (underscore) {
  "use strict";
  var that = this;

  var count_empty_cells = function (cells) {
    var i = 0; // row index
    var j = 0; // column index
    var count = 0;

    for (i = 0; i < 9; i += 1) {
      for (j = 0; j < 9; j += 1) {
        if (cells[i][j] === 0) {
          count += 1;
        }
      }
    }
    return count;
  };

  // checks if n complies to the rules of sudoku for cell (i, j) from cells
  var is_eligible = function (n, i, j, cells) {
    var k = 0; // variable cell index
    var m = i - (i % 3); // top row of the current square.
    var l = j - (j % 3); // left column of the current sqare.
    var square_row = 0;
    var square_col = 0;
    for (k = 0; k < 9; k += 1) {
      if (k !== j) {
        if (cells[i][k] === n) {
          return false;
        }
      }
      if (k !== i) {
        if (cells[k][j] === n) {
          return false;
        }
      }
      square_row = m + Math.floor((k / 3));
      square_col = l + (k % 3);
      if (square_row !== i || square_col !== j) {
        if (cells[square_row][square_col] === n) {
          return false;
        }
      }
    }

    return true;
  };

  // checks if a number is eligible candidate and if so adds id to a 3-dimensional array
  var find_candidates = function (cells) {
    var i = 0;
    var j = 0;
    var n = 0; // current probable candidate
    var cand = [];
    for (i = 0; i < 9; i += 1) {
      cand[i] = [];
      for (j = 0; j < 9; j += 1) {
        cand[i][j] = [];
        if (cells[i][j] === 0) {
          for (n = 1; n <= 9; n += 1) {
            if (is_eligible(n, i, j, cells)) {
              cand[i][j].push(n);
            }
          }
        }
      }
    }
    return cand;
  };

  var count = function (cand) {
    var i = 0;
    var j = 0;
    var cnt = 0;

    for (i = 0; i < 9; i += 1) {
      for (j = 0; j < 9; j += 1) {
        cnt += cand[i][j].length;
      }
    }
    return cnt;
  };

  /* checks if there are solitary candidates for a cell. If true, the candidate
   * is written to the cell and is popped out of the candidates array.
   * The operation is performed for every empty cell in cells
   */
  var put_lone_candidates = function (cells, candidates) {
    var i = 0; // current row
    var j = 0; // current column

    for (i = 0; i < 9; i += 1) {
      for (j = 0; j < 9; j += 1) {
        if (cells[i][j] === 0) {
          if (candidates[i][j].length === 1) {
            cells[i][j] = candidates[i][j].pop();
          }
        }
      }
    }
  };

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
  var traverse_trough_blocks = function (cells, callback) {
    var i = 0;
    var candidates = find_candidates(cells);
    var row_callback =  function (cand, r, c) {
      return [cand[r][c], [r, c]];
    };
    var column_callback = function (cand, r, c) {
      return [cand[c][r], [c, r]];
    };
    var square_callback = function (cand, r, c) {
      var m = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      var l = (r % 3) * 3 + (c % 3);
      return [cand[m][l], [m, l]];
    };
    for (i = 0; i < 9; i += 1) {
      //rows
      candidates = callback(i, cells, candidates, row_callback);
      //columns
      candidates = callback(i, cells, candidates, column_callback);
      //squares
      candidates = callback(i, cells, candidates, square_callback);
    }
    return cells;
  };

  /*
   * puts the coordinates of the cells with candidates with given value
   */
  var find_cand_coords_by_value = function (cand, i, callback) {
    var j;
    var cellCandidatesInfo;
    var block_candidates = [[], [], [], [], [], [], [], [], []];
    var fill_in_block_candidates = function (element) {
        block_candidates[element - 1].push(cellCandidatesInfo[1]);
      };
    for (j = 0; j < 9; j += 1) {
      cellCandidatesInfo = callback(cand, i, j);
      cellCandidatesInfo[0].forEach(fill_in_block_candidates, this);
    }
    return block_candidates;
  };

  var remove_block_candidates = function (candidates, num, r, c, callback) {
    var j = 0;
    var crds;
    var check_candidate = function (e) {
        return e !== num || underscore.isEqual(crds, [r, c]);
      };
    for (j = 0; j < 9; j += 1) {
      crds = callback(r, c, j);
      candidates[crds[0]][crds[1]] = candidates[crds[0]][crds[1]].filter(check_candidate, this);
    }
  };

  var remove_candidates = function (candidates, num, r, c) {
    remove_block_candidates(candidates, num, r, c, function (i, j, k) {
      return [i, k];
    });
    remove_block_candidates(candidates, num, r, c, function (i, j, k) {
      return [k, j];
    });
    remove_block_candidates(candidates, num, r, c, function (i, j, k) {
      var m = Math.floor(i / 3) * 3 + Math.floor(k / 3);
      var l = Math.floor(j / 3) * 3 + (k % 3);
      return [m, l];
    });
  };

  var put_block_unique_candidates = function (i, cells, cand, callback) {
    var r, c, j;
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
  };

  /*
   * removes every candidate with number num from the cells in the block defined
   * by i and callback except the cells in pc.
   */
  var remove_candidates_from_block = function (candidates, i, num, pc, callback) {
    var coords;
    var j;
    var check_candidates = function (e) {
      return num.indexOf(e) === -1;
    };
    for (j = 0; j < 9; j += 1) {
      coords = callback(i, j);
      if (pc.indexOf(coords) === -1) {
        candidates[coords[0]][coords[1]] = candidates[coords[0]][coords[1]].filter(check_candidates, this);
      }
    }
    console.log("candidates are being removed!");
  };

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
   var regard_locked_pairs = function (i, cells, cand, callback) {
    var j, k;
    var cell;
    var other;
    var pair_candidates = [];
    var get_coords = function (r, c) {
      return callback(cand, r, c)[1];
    };
    console.log("the regard_locked_pairs function gets invoked");
    for (j = 0; j < 9; j += 1) {
      pair_candidates = [];
      cell = callback(cand, i, j);
      if (cell[0].length >= 2) {
        for (k = 0; k < 9; k += 1) {
          other = callback(cand, i, k);
          if (underscore.isEqual(cell[0], other[0])) {
            pair_candidates.push(other[1]);
          }
        }
        if (pair_candidates.length === cell[0].length) {
          console.log("There are some pairs or triplets!");
          remove_candidates_from_block(cand, i, cell[0], pair_candidates, get_coords);
        }
      }
    }
    return cand;
  };

  var has_bad_cells = function (cells, candidates) {
    var i, j;
    for (i = 0; i < 9; i += 1) {
      for (j = 0; j < 9; j += 1) {
        if (cells[i][j] === 0 && candidates[i][j].length === 0) {
          return true;
        }
      }
    }
    return false;
  };

  var solve_with_common_logic = function (puzzle) {
    var candidates;
    var candidates_count = 0;
    var new_count = -1;
    //var empty_cells;
    if (puzzle === undefined) {
      return null;
    }
    //empty_cells = count_empty_cells(puzzle);
    while (candidates_count !== new_count) {
      if (candidates_count !== new_count) {
        candidates = find_candidates(puzzle);
        candidates_count = count(candidates);
        put_lone_candidates(puzzle, candidates);
        puzzle = traverse_trough_blocks(puzzle, put_block_unique_candidates);
        new_count = count(candidates);
      }
      if (candidates_count === new_count) {
        puzzle = traverse_trough_blocks(puzzle, regard_locked_pairs);
        new_count = count(candidates);
      }
      console.log("candidates count:" + new_count);
    }
    return [puzzle, candidates];
  };

  var find_next_free_cell = function (cells) {
    var i, j;
    i = 0;
    j = 0;
    while (cells[i][j] !== 0 && (i !== 9 && j !== 9)) {
      j = (j + 1) % 9;
      if (j === 0) {
        i += 1;
      }
    }
    if (i === 9 && j === 9) {
      return null;
    }
    return [i, j];
  };

  //TODO: test this method.
  var backtrack = function (cells, candidates) {
    var crds;
    var results;
    var tracked_cells;
    var cand;
    var work_cells;
    var track_val;
    if (candidates === undefined) {
      candidates = find_candidates(cells);
    }
    cand = candidates.slice();
    work_cells = cells.slice();

    crds = find_next_free_cell(work_cells);
    tracked_cells = null;
    while (cand[crds[0]][crds[1]].length > 0) {
      results = solve_with_common_logic(work_cells, cand);
      if (count_empty_cells(results[0]) === 0) {
        return results[0];
      }
      if (has_bad_cells(results[0], results[1])) {
        return null;
      }
      track_val = cand[crds[0]][crds[1]][0];
      work_cells[crds[0]][crds[1]] = track_val; //add a value to the first empty cell in cells
      tracked_cells = backtrack(work_cells, cand);
      if (tracked_cells === null) {
        cand[crds[0]][crds[1]] = cand[crds[0]][crds[1]].filter(function (e) {
          return e !== track_val;
        }, this);
      }
    }
    return tracked_cells;
  };

  // solves SudokuPuzzles. Takes a SudokuPuzzle object
  this.solve = function (puzzle) {
    var common_logic_result;
    var candidates;

    common_logic_result = solve_with_common_logic(puzzle);

    puzzle = common_logic_result[0];
    candidates = common_logic_result[1];
    if (count_empty_cells(puzzle) !== 0) {
      //TODO: implement backtracking solving algorithm.
      puzzle = backtrack(puzzle, candidates);
    }

    // if (count_empty_cells(work_cells) === 0) {
    //} else {
    //  return null;
    //}

    return puzzle;
  };
};
















