const BORDER_WALL = -2;
const INNER_WALL = -1;
const UNVISITED_WALL = 0;
const PATH_CELL = 1;
const START_CELL = 2;
const FINISH_CELL = 3;

function generateMaze(rows, cols) {
    const maze = getEmptyMaze(rows, cols);
    let seed = getRandomCell(maze);
    markCell(maze, seed, PATH_CELL);
    let frontier = getWalls(maze, seed);
    while (frontier.length > 0) {
        let index = getRandomIndex(frontier);
        let cell = frontier[index];
        frontier.splice(index, 1);
        if (isValidPath(maze, cell)) {
            markCell(maze, cell, PATH_CELL);
            let walls = getWalls(maze, cell);
            shuffle(walls);
            for (let i = 0; i < walls.length; i++) {
                if (!frontier.includes(walls[i])) {
                    frontier.push(walls[i]);
                }
            }
        } else {
            markCell(maze, cell, INNER_WALL);
        }
    }
    return maze;
}
function getEmptyMaze(rows, cols) {
    if (rows <= 1 || cols <= 1) {
        return;
    }
    let maze = getEmptyMatrix(rows, cols, 0);
    for (let i = 0; i < rows; i++) {
        markCell(maze, [i, 0], BORDER_WALL);
        markCell(maze, [i, cols - 1], BORDER_WALL);
    }
    for (let i = 0; i < cols; i++) {
        markCell(maze, [0, i], BORDER_WALL);
        markCell(maze, [rows - 1, i], BORDER_WALL);
    }
    return maze;
}
function getEmptyMatrix(rows, cols, defalutValue) {
    if (rows <= 0 || cols <= 0) {
        return;
    }
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        let matrixRow = [];
        for (let j = 0; j < cols; j++) {
            matrixRow.push(defalutValue);
        }
        matrix.push(matrixRow);
    }
    return matrix;
}
function markCell(maze, cell, value) {
    let cellRow = cell[0];
    let cellCol = cell[1];
    maze[cellRow][cellCol] = value;
}
function getRandomCell(maze) {
    let rows = maze.length - 1;
    let cols = maze[0].length - 1;
    let row = Math.floor(Math.random() * rows + 1);
    let col = Math.floor(Math.random() * cols + 1);
    let randomCell = [row, col];
    return randomCell;
}
function getWalls(maze, cell) {
    let walls = [];
    let neighbors = getNeighbors(cell);
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (isCell(maze, neighbor, UNVISITED_WALL)) {
            walls.push(neighbor);
        }
    }
    return walls;
}
function getNeighbors(cell) {
    let neighbors = [];
    neighbors.push(getLeft(cell));
    neighbors.push(getTop(cell));
    neighbors.push(getRight(cell));
    neighbors.push(getBottom(cell));
    return neighbors;
}
function getDiagonals(cell) {
    let diagonals = [];
    diagonals.push(getTopLeft(cell));
    diagonals.push(getTopRight(cell));
    diagonals.push(getBottomLeft(cell));
    diagonals.push(getBottomRight(cell));
    return diagonals;
}
function getTopLeft(cell) {
    return [cell[0] - 1, cell[1] - 1];
}
function getLeft(cell) {
    return [cell[0] - 1, cell[1]];
}
function getBottomLeft(cell) {
    return [cell[0] - 1, cell[1] + 1];
}
function getTop(cell) {
    return [cell[0], cell[1] - 1];
}
function getBottom(cell) {
    return [cell[0], cell[1] + 1];
}
function getTopRight(cell) {
    return [cell[0] + 1, cell[1] - 1];
}
function getRight(cell) {
    return [cell[0] + 1, cell[1]];
}
function getBottomRight(cell) {
    return [cell[0] + 1, cell[1] + 1];
}
function isCell(maze, cell, value) {
    let row = cell[0];
    let col = cell[1];
    if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) {
        return false;
    }
    return maze[row][col] === value;
}
function getRandomIndex(arr) {
    let x = arr.length - 1;
    if (Math.random() < 0.25) {
        x = Math.floor(Math.random() * arr.length);
    }
    return x;
}
function isValidPath(maze, cell) {
    var hasSpace = ensureSpacing(maze, cell);
    var surroundingPathCount = countSurroundingPathCells(maze, cell);
    return (hasSpace && surroundingPathCount < 3);
}
function ensureSpacing(maze, cell) {
    let topLeft = getTopLeft(cell);
    let left = getLeft(cell);
    let bottomLeft = getBottomLeft(cell);
    let top = getTop(cell);
    let bottom = getBottom(cell);
    let topRight = getTopRight(cell);
    let right = getRight(cell);
    let bottomRight = getBottomRight(cell);
    if (isCell(maze, left, PATH_CELL) &&
        (isCell(maze, topRight, PATH_CELL) || isCell(maze, bottomRight, PATH_CELL))) return false;
    if (isCell(maze, right, PATH_CELL) &&
        (isCell(maze, topLeft, PATH_CELL) || isCell(maze, bottomLeft, PATH_CELL))) return false;
    if (isCell(maze, top, PATH_CELL) &&
        (isCell(maze, bottomRight, PATH_CELL) || isCell(maze, bottomLeft, PATH_CELL))) return false;
    if (isCell(maze, bottom, PATH_CELL) &&
        (isCell(maze, topRight, PATH_CELL) || isCell(maze, topLeft, PATH_CELL))) return false;
    return true;
}
function eliminateLoops(maze, cell) {
    let neighbors = getNeighbors(cell);
    let count = 0;
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (isCell(maze, neighbor, PATH_CELL)) count++;
    }
    return (count < 3);
}
function countSurroundingPathCells(maze, cell) {
    let surroundingCells = getSurroundingCells(cell);
    let count = 0;
    for (let i = 0; i < surroundingCells.length; i++) {
        if (isCell(maze, surroundingCells[i], PATH_CELL)) count++;
    }
    return count;
}
function getSurroundingCells(cell) {
    return getNeighbors(cell).concat(getDiagonals(cell));
}
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}


function drawMaze(maze, canvas, cellWidth) {
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[0].length; j++) {
            let cell = [i, j];
            drawCell(maze, cell, canvas, cellWidth);
        }
    }
}
function drawCell(maze, cell, canvas, cellWidth) {
    let row = cell[0];
    let col = cell[1];
    if (isCell(maze, cell, PATH_CELL)) {
        canvas.fillStyle = 'rgb(170,235,255)';
    } else if (isCell(maze, cell, INNER_WALL)) {
        canvas.fillStyle = 'rgb(48,25,52)';
    } else if (isCell(maze, cell, BORDER_WALL)) {
        canvas.fillStyle = 'rgb(48,25,52)';
    } else if (isCell(maze, cell, UNVISITED_WALL)) {
        canvas.fillStyle = 'rgb(48,25,52)';
    } else if (isCell(maze, cell, START_CELL)) {
        canvas.fillStyle = 'red';
    } else if (isCell(maze, cell, FINISH_CELL)) {
        canvas.fillStyle = 'green';
    }
    canvas.beginPath();
    canvas.fillRect(col * cellWidth, row * cellWidth, cellWidth, cellWidth);
}


function initializeObjective(maze) {
    let points = [];
    let start = getRandomPathCell(maze);
    let finish = getRandomPathCell(maze);
    points.push(start);
    points.push(finish);
    markCell(maze, start, START_CELL);
    markCell(maze, finish, FINISH_CELL);
    return points;
}
function getRandomPathCell(maze) {
    let cell = [0, 0];
    while (!isCell(maze, cell, PATH_CELL)) {
        cell = getRandomCell(maze);
    }
    return cell;
}


function drawObjectives(maze, objectives, canvas, cellWidth) {
    drawCell(maze, objectives[0], canvas, cellWidth);
    drawCell(maze, objectives[1], canvas, cellWidth)
}






function animateDFS(maze, _stack, visited, canvas, cellWidth, path) {
    drawVisited(visited, canvas, cellWidth);
    path = DFS(maze, _stack, visited);
    drawPath(path, canvas, cellWidth);
}
function drawVisited(visited, canvas, cellWidth) {
    for (let i = 0; i < visited.length; i++) {
        for (let j = 0; j < visited[0].length; j++) {
            if (visited[i][j]) {
                canvas.fillStyle = 'pink';
                canvas.beginPath();
                canvas.fillRect(j * cellWidth, i * cellWidth, cellWidth, cellWidth);
            }
        }
    }
}
function DFS(maze, _stack, visited) {
    if (_stack.length != 0) {
        let cell = _stack[_stack.length - 1];
        if (maze[cell[0]][cell[1]] == 3) {
            return _stack;
        } else {
            visited[cell[0]][cell[1]] = 1;
            let moves = getMoves(cell, maze, visited);
            if (moves.length == 0) {
                _stack.pop();
            } else {
                let index = Math.floor(Math.random() * moves.length);
                _stack.push(moves[index]);
            }
        }
    }
    return _stack;
}
function getMoves(cell, maze, visited) {
    let neighbors = getNeighbors(cell, maze);
    let moves = [];
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        let x = neighbor[0];
        let y = neighbor[1];
        if (maze[x][y] > 0 && !visited[x][y]) {
            moves.push(neighbor);
        }
    }
    return moves;
}
function drawPath(path, canvas, cellWidth) {
    for (let i = 0; i < path.length; i++) {
        let currCell = path[i];
        let offset = cellWidth / 8;
        canvas.fillStyle = 'blue';
        canvas.beginPath();
        canvas.fillRect(currCell[1] * cellWidth + offset, currCell[0] * cellWidth + offset, cellWidth - offset * 2, cellWidth - offset * 2);
    }
}


function animateBFS(maze, _queue, visited, canvas, cellWidth, path) {
    drawVisited(visited, canvas, cellWidth);
    if (_queue.length > 0) {
        let temp = BFS(maze, _queue, visited);
        if (temp) {
            path.push(temp);
        }
    }
    if (path.length > 0) {
        let last = path[path.length - 1];
        let next = getPathBFS(last, visited);
        if (!(last[0] == next[0] && last[1] == next[1])) {
            path.push(next);
        }
    }
    drawPath(path, canvas, cellWidth);
}
function BFS(maze, _queue, visited) {
    if (_queue.length > 0) {
        let cell = _queue.shift();
        if (maze[cell[0]][cell[1]] == 3) {
            _queue.splice(0, _queue.length);
            return cell;
        } else {
            let layer = visited[cell[0]][cell[1]] + 1;
            let moves = getMoves(cell, maze, visited);
            if (moves.length != 0) {
                for (let i = 0; i < moves.length; i++) {
                    _queue.push(moves[i]);
                    visited[moves[i][0]][moves[i][1]] = layer;
                }
            }
        }
    }
}
function getPathBFS(currCell, visited) {
    let neighbors = getNeighbors(currCell);
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (visited[neighbor[0]][neighbor[1]] > 0) {
            if (visited[neighbor[0]][neighbor[1]] < visited[currCell[0]][currCell[1]]) {
                currCell = neighbor;
            }
        }
    }
    return currCell;
}
function driverDFS(start) {
    let _stack = [];
    _stack.push(start);
    return _stack;
}
function driverBFS(start, visited) {
    let _queue = [];
    _queue.push(start);
    visited[start[0]][start[1]] = 1;
    return _queue;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
const myTop = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;
class PriorityQueue {

    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    ////////////////////////////
    clear() {
        this._heap.splice(0, this._heap.length);
    }
    ////////////////////////////
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[myTop];
    }
    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > myTop) {
            this._swap(myTop, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[myTop] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > myTop && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }
    _siftDown() {
        let node = myTop;
        while (
            (left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
        ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}

function GreedyBestFirstSearch(maze, _priorityQueue, visited, finishCell) {
    // console.log(_priorityQueue);
    // console.log("called");
    if (!_priorityQueue.isEmpty()) {
        let cell = _priorityQueue.pop();
        if (maze[cell[0]][cell[1]] == 3) {
            _priorityQueue.clear();
            return cell;
        } else {
            let steps = visited[cell[0]][cell[1]] + 1;
            let moves = getMoves(cell, maze, visited);
            if (moves.length != 0) {
                for (let i = 0; i < moves.length; i++) {
                    let move = moves[i];
                    _priorityQueue.push(move);
                    visited[move[0]][move[1]] = steps;
                }
            }
        }
    }
}
function animateGBFS(maze, _priorityQueue, visited, canvas, cellWidth, path, finishCell) {
    drawVisited(visited, canvas, cellWidth);
    // console.log(_priorityQueue);
    // console.log("Inside");
    if (!_priorityQueue.isEmpty()) {
        // console.log("Getting Deeper");
        let temp = GreedyBestFirstSearch(maze, _priorityQueue, visited, finishCell);
        if (temp) {
            path.push(temp);
        }
    }
    if (path.length > 0) {
        let last = path[path.length - 1];
        let next = getPathBFS(last, visited);
        // console.log(next);
        if (!(last[0] == next[0] && last[1] == next[1])) {
            path.push(next);
        }
    }
    // console.log(path);
    // for (let i = 0; i < _priorityQueue.size(); i++){

    // }
    // path = _priorityQueue._heap;
    drawPath(path, canvas, cellWidth);
}
// function getPathGBFS(currCell, visited) {
//     let neighbors = getNeighbors(currCell);
//     for (let i = 0; i < neighbors.length; i++) {
//         let neighbor = neighbors[i];
//         if (visited[neighbor[0]][neighbor[1]] > 0) {
//             if (visited[neighbor[0]][neighbor[1]] < visited[currCell[0]][currCell[1]]) {
//                 currCell = neighbor;
//             }
//         }
//     }
//     return currCell;
// }

function driverGBFS(start, finishCell, visited) {
    _priorityQueue = new PriorityQueue((cell1, cell2) => heuristic(cell1, finishCell) < heuristic(cell2, finishCell));
    _priorityQueue.push(start);
    visited[start[0]][start[1]] = 1;
    // console.log(_priorityQueue);
    return _priorityQueue;
}

function heuristic(startCell, finishCell) {
    let x1 = startCell[0];
    let x2 = finishCell[0];
    let y1 = startCell[1];
    let y2 = finishCell[1];
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
window.onload = function () {
    const canvas = document.getElementById('maze');
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const cellWidth = 10;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    const rows = Math.floor(canvas.height / cellWidth);
    const cols = Math.floor(canvas.width / cellWidth);
    const maze = generateMaze(rows, cols);
    const objectives = initializeObjective(maze);
    const start = objectives[0];
    const finish = objectives[1];
    let visited = getEmptyMatrix(rows, cols, 0);
    let dataStructure;
    let path;
    let searchAlgorithmSelected = "GBFS";
    switch (searchAlgorithmSelected) {
        case "DFS": dataStructure = driverDFS(start);
            path = dataStructure;
            break;
        case "BFS": dataStructure = driverBFS(start, visited);
            path = [];
            break;
        case "GBFS": dataStructure = driverGBFS(start, finish, visited);
            path = [];
            // console.log("instantiated");
            // console.log(dataStructure);
            break;
    }
    drawMaze(maze, ctx, cellWidth);
    function Update() {
        // console.log(dataStructure);
        switch (searchAlgorithmSelected) {
            case "DFS": animateDFS(maze, dataStructure, visited, ctx, cellWidth);
                break;
            case "BFS": animateBFS(maze, dataStructure, visited, ctx, cellWidth, path);
                break;
            case "GBFS": animateGBFS(maze, dataStructure, visited, ctx, cellWidth, path, finish);
                // console.log(dataStructure);
                break;
        }
        drawObjectives(maze, objectives, ctx, cellWidth);
        requestAnimationFrame(Update);
    }
    Update();
};