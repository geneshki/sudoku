module("puzzle cells generation");

test("Should generate a puzzle grid of 9x9 cells", function() {
  var puzzle = new SudokuPuzzle();

  ok(puzzle.cells, "The cells array is defined");
});

test("Should generate a puzzle object from a 9x9 array", function() {
  var puzzleCells=[ [0,2,0,0,0,4,3,0,0],
                    [9,0,0,0,2,0,0,0,8],
                    [0,0,0,6,0,9,0,5,0],
                    [0,0,0,0,0,0,0,0,1],
                    [0,7,2,5,0,3,6,8,0],
                    [6,0,0,0,0,0,0,0,0],
                    [0,8,2,5,0,0,0,0,0],
                    [1,0,0,0,9,0,0,0,3],
                    [0,0,9,8,0,0,0,6,0] ];
  var puzzle = new SudokuPuzzle(puzzleCells);
  deepEqual(puzzle.cells, puzzleCells, "the generated grid used the provided pattern");
});



module("puzzle solution generation");
test("SudokuSolver function should generate a SudokuSolver object", function() {
  var solver = new SudokuSolver();
  equal(typeof solver, 'object', "solver is created");
  equal(typeof solver.solve, 'function', "Function 'solve' is present");
});

test( "solve() should return a valid sudoku solution.", function() {
  var puzzleCells = [ [0,2,0,0,0,4,3,0,0],
                      [9,0,0,0,2,0,0,0,8],
                      [0,0,0,6,0,9,0,5,0],
                      [0,0,0,0,0,0,0,0,1],
                      [0,7,2,5,0,3,6,8,0],
                      [6,0,0,0,0,0,0,0,0],
                      [0,8,0,2,0,5,0,0,0],
                      [1,0,0,0,9,0,0,0,3],
                      [0,0,9,8,0,0,0,6,0] ];
  var solvedPuzzle = [[8,2,7,1,5,4,3,9,6],
                      [9,6,5,3,2,7,1,4,8],
                      [3,4,1,6,8,9,7,5,2],
                      [5,9,3,4,6,8,2,7,1],
                      [4,7,2,5,1,3,6,8,9],
                      [6,1,8,9,7,2,4,3,5],
                      [7,8,6,2,3,5,9,1,4],
                      [1,5,4,7,9,6,8,2,3],
                      [2,3,9,8,4,1,5,6,7]];
  var solver = new SudokuSolver();
  var solution = solver.solve(puzzleCells);
  deepEqual(solution, solvedPuzzle, "The puzzle is solved correctly");
});

test(" solve() should return a valid evil sudoku solution.", function() {
  var evilCells = [ [ 0,0,0,0,3,0,0,0,7 ],
                    [ 0,2,0,0,0,0,0,9,0 ],
                    [ 0,0,4,2,0,1,6,0,0 ],
                    [ 0,0,5,0,0,0,8,0,0 ],
                    [ 0,0,0,7,0,6,0,0,0 ],
                    [ 0,0,7,0,0,0,4,0,0 ],
                    [ 0,0,6,5,0,9,2,0,0 ],
                    [ 0,3,0,0,0,0,0,8,0 ],
                    [ 1,0,0,0,4,0,0,0,0 ]];
  var evilSolution =[[5,6,8,9,3,4,1,2,7],
                     [7,2,1,8,6,5,3,9,4],
                     [3,9,4,2,7,1,6,5,8],
                     [6,1,5,4,9,3,8,7,2],
                     [2,4,3,7,8,6,9,1,5],
                     [9,8,7,1,5,2,4,3,6],
                     [8,7,6,5,1,9,2,4,3],
                     [4,3,9,6,2,7,5,8,1],
                     [1,5,2,3,4,8,7,6,9]];
  var solver = new SudokuSolver();
  var puzzle = new SudokuPuzzle(evilCells);
  var solution = solver.solve(evilCells);
  deepEqual(solution, evilSolution, "The evil puzzle is solved correctly");
});

test("isValid() should return true if the given solution is valid.", function() {
  fail("test not implemented");
});
