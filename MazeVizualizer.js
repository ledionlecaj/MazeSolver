//classes
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
    clear() {
        this._heap.splice(0, this._heap.length);
    }
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

class Queue {
    constructor(_array = []) {
        this._queue = _array;
        this.offset = 0;
    }
    size() {
        return this._queue.length - this.offset;
    }
    clear() {
        this._queue.splice(0, this._queue.length);
        this.offset = 0;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this.isEmpty() ? undefined : this._queue[this.offset];
    }
    enqueue(...values) {
        values.forEach(value => {
            this._queue.push(value);
        });
        return this.size();
    }
    dequeue() {
        if (this.isEmpty()) return undefined;
        var item = this._queue[this.offset++];
        if (this.offset * 2 >= this._queue.length) {
            this._queue.splice(0, this.offset);
            this.offset = 0;
        }
        return item;
    }
}


//functions
const BORDER_WALL = -2;
const INNER_WALL = -1;
const UNVISITED_WALL = 0;
const PATH_CELL = 1;
const START_CELL = 2;
const FINISH_CELL = 3;
var cellWidth = 15;
var ctx;
var maze;
var objectives;
var pathSelectionDFS = "sequential";
var heuristicFunction = "manhattan";
var bidirectional = false;

function generateMaze(rows, cols) {
    var maze = getEmptyMaze(rows, cols);
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
function drawMaze(maze) {
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[0].length; j++) {
            let cell = [i, j];
            drawCell(maze, cell);
        }
    }
}
function drawCell(maze, cell) {
    let row = cell[0];
    let col = cell[1];
    if (isCell(maze, cell, PATH_CELL)) {
        ctx.fillStyle = 'rgb(170,235,255)';
    } else if (isCell(maze, cell, INNER_WALL)) {
        ctx.fillStyle = 'rgb(48,25,52)';
    } else if (isCell(maze, cell, BORDER_WALL)) {
        ctx.fillStyle = 'rgb(48,25,52)';
    } else if (isCell(maze, cell, UNVISITED_WALL)) {
        ctx.fillStyle = 'rgb(48,25,52)';
    } else if (isCell(maze, cell, START_CELL)) {
        ctx.fillStyle = 'green';
    } else if (isCell(maze, cell, FINISH_CELL)) {
        ctx.fillStyle = 'red';
    }
    ctx.beginPath();
    ctx.fillRect(col * cellWidth, row * cellWidth, cellWidth, cellWidth);
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
function drawObjectives(maze, objectives) {
    drawCell(maze, objectives[0], cellWidth);
    drawCell(maze, objectives[1], cellWidth)
}
function animateDFS(maze, _stack, visited, path) {
    drawVisited(visited);
    path = DFS(maze, _stack, visited);
    drawPath(path);
}
function drawVisited(visited) {
    for (let i = 0; i < visited.length; i++) {
        for (let j = 0; j < visited[0].length; j++) {
            if (visited[i][j] > 0) {
                ctx.fillStyle = 'rgb(152,251,152)';
                ctx.beginPath();
                ctx.fillRect(j * cellWidth, i * cellWidth, cellWidth, cellWidth);
            }
            if (visited[i][j] < 0) {
                ctx.fillStyle = 'pink';
                ctx.fillRect(j * cellWidth, i * cellWidth, cellWidth, cellWidth);
            }
        }
    }
}
function DFS(maze, _stack, visited) {
    if (_stack.length != 0) {
        let cell = _stack[_stack.length - 1];
        if (maze[cell[0]][cell[1]] == FINISH_CELL) {
            return _stack;
        } else {
            visited[cell[0]][cell[1]] = 1;
            let moves = getMoves(cell, maze, visited);
            if (moves.length == 0) {
                _stack.pop();
            } else {
                var index = 0;
                if (pathSelectionDFS === "random") {
                    index = Math.floor(Math.random() * moves.length);
                }
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
function drawPath(path) {
    for (let i = 0; i < path.length; i++) {
        let currCell = path[i];
        let offset = cellWidth / 8;
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.fillRect(currCell[1] * cellWidth + offset, currCell[0] * cellWidth + offset, cellWidth - offset * 2, cellWidth - offset * 2);
    }
}
function animateBFS(maze, _queue, visited, path) {
    drawVisited(visited, cellWidth);
    if (!_queue.isEmpty()) {
        let temp = BFS(maze, _queue, visited);
        if (temp) {
            path.push(temp);
        }
    }
    if (path.length > 0) {
        let last = path[path.length - 1];
        let next = getPath(last, visited);
        if (!(last[0] == next[0] && last[1] == next[1])) {
            path.push(next);
        }
    }
    drawPath(path);
}
function BFS(maze, _queue, visited) {
    if (!_queue.isEmpty()) {
        let cell = _queue.dequeue();
        if (maze[cell[0]][cell[1]] == FINISH_CELL) {
            _queue.clear();
            return cell;
        } else {
            let steps = visited[cell[0]][cell[1]] + 1;
            let moves = getMoves(cell, maze, visited);
            if (moves.length != 0) {
                for (let i = 0; i < moves.length; i++) {
                    _queue.enqueue(moves[i]);
                    visited[moves[i][0]][moves[i][1]] = steps;
                }
            }
        }
    }
}
function driverBFS(start, visited) {
    let _queue = new Queue();
    _queue.enqueue(start);
    visited[start[0]][start[1]] = 1;
    return _queue;
}
function getPath(currCell, visited) {
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
function animateGBFS(maze, _priorityQueue, visited, path) {
    drawVisited(visited);
    if (!_priorityQueue.isEmpty()) {
        let temp = GreedyBestFirstSearch(maze, _priorityQueue, visited);
        if (temp) {
            path.push(temp);
        }
    }
    if (path.length > 0) {
        let last = path[path.length - 1];
        let next = getPath(last, visited);
        if (!(last[0] == next[0] && last[1] == next[1])) {
            path.push(next);
        }
    }
    drawPath(path);
}
function GreedyBestFirstSearch(maze, _priorityQueue, visited) {
    if (!_priorityQueue.isEmpty()) {
        let cell = _priorityQueue.pop();
        if (maze[cell[0]][cell[1]] == FINISH_CELL) {
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
function driverDFS(start) {
    let _stack = [];
    _stack.push(start);
    return _stack;
}

function driverGBFS(start, finishCell, visited) {
    var heuristic;
    switch (heuristicFunction) {
        case "manhattan": heuristic = manhattanDistance;
            break;
        case "euclidian": heuristic = euclidianDistance;
            break;
        default: heuristic = manhattanDistance;
            break;

    }
    _priorityQueue = new PriorityQueue((cell1, cell2) => heuristic(cell1, finishCell) < heuristic(cell2, finishCell));
    _priorityQueue.push(start);
    visited[start[0]][start[1]] = 1;
    return _priorityQueue;
}

function manhattanDistance(startCell, finishCell) {
    let x1 = startCell[0];
    let x2 = finishCell[0];
    let y1 = startCell[1];
    let y2 = finishCell[1];
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
function euclidianDistance(startCell, finishCell) {
    let x1 = startCell[0];
    let x2 = finishCell[0];
    let y1 = startCell[1];
    let y2 = finishCell[1];
    return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5);
}
////////////////////////////////////////////////////////////////////////////////
function animateBFS_bi_directional(maze, _queue, visited, path) {
    drawVisited(visited);
    if (!_queue.isEmpty()) {
        let temp = bi_directionalBFS(maze, _queue, visited);
        if (temp) {
            path.push(temp);
            let steps = visited[temp[0]][temp[1]];
            let neighbors = getNeighbors(temp);
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];
                if (steps > 0) {
                    if (visited[neighbor[0]][neighbor[1]] < 0) {
                        path.push(neighbor);
                    }
                } else {
                    if (visited[neighbor[0]][neighbor[1]] > 0) {
                        path.push(neighbor);
                    }
                }
            }
        }
    }
    if (path.length > 0) {
        let last1 = path[path.length - 2];
        let last2 = path[path.length - 1];
        let next1 = getPathBFS_bi_directional(last1, visited);
        let next2 = getPathBFS_bi_directional(last2, visited);
        if (!(last1[0] == next1[0] && last1[1] == next1[1])) {
            path.push(next1);
        }
        if (!(last2[0] == next2[0] && last2[1] == next2[1])) {
            path.push(next2);
        }
    }
    drawPath(path);
}
function bi_directionalBFS(maze, _queue, visited) {
    if (!_queue.isEmpty()) {
        let cell = _queue.dequeue();
        let steps = visited[cell[0]][cell[1]];
        let neighbors = getNeighbors(cell);
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (steps > 0) {
                if (visited[neighbor[0]][neighbor[1]] < 0) {
                    //found intersection
                    _queue.clear();
                    return neighbor;
                } else if (!visited[neighbor[0]][neighbor[1]] && isCell(maze, neighbor, PATH_CELL)) {
                    visited[neighbor[0]][neighbor[1]] = steps + 1;
                    _queue.enqueue(neighbor);
                }
            } else {
                if (visited[neighbor[0]][neighbor[1]] > 0) {
                    //found intersection
                    _queue.clear();
                    return neighbor;
                } else if (!visited[neighbor[0]][neighbor[1]] && isCell(maze, neighbor, PATH_CELL)) {
                    visited[neighbor[0]][neighbor[1]] = steps - 1;
                    _queue.enqueue(neighbor);
                }
            }

        }
    }
}
function driverBFS_bi_directional(start, finish, visited) {
    let _queue = new Queue();
    _queue.enqueue(start);
    _queue.enqueue(finish);
    visited[start[0]][start[1]] = 1;
    visited[finish[0]][finish[1]] = -1;
    return _queue;
}
function getPathBFS_bi_directional(currCell, visited) {
    let neighbors = getNeighbors(currCell);
    let steps = visited[currCell[0]][currCell[1]];
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (steps > 0) {
            if (visited[neighbor[0]][neighbor[1]] > 0) {
                if (visited[neighbor[0]][neighbor[1]] < steps) {
                    currCell = neighbor;
                }
            }
        } else {
            if (visited[neighbor[0]][neighbor[1]] < 0) {
                if (visited[neighbor[0]][neighbor[1]] >= steps) {
                    currCell = neighbor;
                }
            }
        }

    }
    return currCell;
}
///////////////////////////////////////////////////////////////////////////////

window.onload = function () {
    var id = null;
    const CANVAS = document.getElementById('maze');
    const ACCORDION = document.getElementById('accordion');
    let canvasWidth = window.innerWidth - ACCORDION.offsetWidth - 20;
    let canvasHeight = window.innerHeight;
    CANVAS.width = canvasWidth - (canvasWidth % cellWidth);
    CANVAS.height = canvasHeight - (canvasHeight % cellWidth);
    ctx = CANVAS.getContext('2d');
    var rows = Math.floor(CANVAS.height / cellWidth);
    var cols = Math.floor(CANVAS.width / cellWidth);
    maze = generateMaze(rows, cols);
    objectives = initializeObjective(maze);
    drawMaze(maze);
    document.getElementById("newMaze").onclick = function () {
        if (id != null) cancelAnimationFrame(id);
        let canvasWidth = window.innerWidth - ACCORDION.offsetWidth - 20;
        let canvasHeight = window.innerHeight;
        CANVAS.width = canvasWidth - (canvasWidth % cellWidth);
        CANVAS.height = canvasHeight - (canvasHeight % cellWidth);
        rows = Math.floor(CANVAS.height / cellWidth);
        cols = Math.floor(CANVAS.width / cellWidth);
        maze = generateMaze(rows, cols);
        objectives = initializeObjective(maze);
        drawMaze(maze);
    };
    document.getElementById("startSearch").onclick = function () {
        if (id != null) cancelAnimationFrame(id);
        drawMaze(maze);
        let start = objectives[0];
        let finish = objectives[1];
        let visited = getEmptyMatrix(rows, cols, 0);
        let dataStructure;
        let path;
        let searchAlgorithmSelected = $("#accordion").accordion("option", "active");
        switch (searchAlgorithmSelected) {
            case 0: dataStructure = driverDFS(start);
                pathSelectionDFS = $("input[name='pathSelectionDFS']:checked").val();
                path = dataStructure;
                break;
            case 1: bidirectional = $('#bidirectionalBFS').is(":checked");
                dataStructure = bidirectional ? driverBFS_bi_directional(start, finish, visited) : driverBFS(start, visited);
                path = [];
                break;
            case 2: heuristicFunction = $("input[name='heuristicGBFS']:checked").val();
                dataStructure = driverGBFS(start, finish, visited);
                path = [];
                break;
        }
        function Update() {
            switch (searchAlgorithmSelected) {
                case 0: animateDFS(maze, dataStructure, visited);
                    break;
                case 1: bidirectional ? animateBFS_bi_directional(maze, dataStructure, visited, path) : animateBFS(maze, dataStructure, visited, path);
                    break;
                case 2: animateGBFS(maze, dataStructure, visited, path);
                    break;
            }
            drawObjectives(maze, objectives);
            id = requestAnimationFrame(Update);
        }
        Update();
    };


}


