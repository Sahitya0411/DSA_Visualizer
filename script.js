let currentVisualizer = 'pathfinding';
let pathfindingSketch, sortingSketch;
let speed = 'veryFast';

// Speed control
document.getElementById('speedSelect').addEventListener('change', (e) => {
    speed = e.target.value;
});

// Switch between visualizers
document.getElementById('visualizerSelect').addEventListener('change', (e) => {
    currentVisualizer = e.target.value;
    document.getElementById('pathfinding-container').classList.toggle('active', currentVisualizer === 'pathfinding');
    document.getElementById('sorting-container').classList.toggle('active', currentVisualizer === 'sorting');
    document.getElementById('pathfindingLegend').style.display = currentVisualizer === 'pathfinding' ? 'flex' : 'none';
    document.getElementById('sortingLegend').style.display = currentVisualizer === 'sorting' ? 'flex' : 'none';
    document.getElementById('algorithmSelect').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('mazeSelect').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('sortingAlgorithmSelect').style.display = currentVisualizer === 'sorting' ? 'block' : 'none';
    document.getElementById('arraySizeSelect').style.display = currentVisualizer === 'sorting' ? 'block' : 'none';
    document.getElementById('setStartBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('setTargetBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('setWallBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('visualizeBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('sortBtn').style.display = currentVisualizer === 'sorting' ? 'block' : 'none';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('clearBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('clearWallsBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('clearPathBtn').style.display = currentVisualizer === 'pathfinding' ? 'block' : 'none';
    document.getElementById('resetArrayBtn').style.display = currentVisualizer === 'sorting' ? 'block' : 'none';
});

// Pathfinding Visualizer
pathfindingSketch = function(p) {
    let grid;
    let cols, rows;
    let cellSize = 25;
    let startNode, targetNode;
    let isDragging = false;
    let mode = 'wall';
    let isVisualizing = false;
    let stopVisualization = false;
    let selectedAlgorithm = 'dijkstra';
    let isWallModeActive = false;
    let visitedCount = 0;

    class Node {
        constructor(i, j) {
            this.i = i;
            this.j = j;
            this.isWall = false;
            this.isStart = false;
            this.isTarget = false;
            this.isVisited = false;
            this.isPath = false;
            this.distance = Infinity;
            this.heuristic = Infinity;
            this.previous = null;
            this.visitOrder = 0;
        }

        show() {
            let x = this.i * cellSize;
            let y = this.j * cellSize;
            if (this.isStart) {
                p.fill(41, 128, 185);
            } else if (this.isTarget) {
                p.fill(155, 89, 182);
            } else if (this.isWall) {
                p.fill(44, 62, 80);
            } else if (this.isPath) {
                p.fill(241, 196, 15);
            } else if (this.isVisited) {
                let t = this.visitOrder / (visitedCount || 1);
                let r = p.lerp(0, 218, t);
                let g = p.lerp(206, 112, t);
                let b = p.lerp(209, 214, t);
                p.fill(r, g, b);
            } else {
                p.fill(236, 240, 241);
            }
            p.stroke(200);
            p.rect(x, y, cellSize, cellSize);
        }
    }

    p.setup = function() {
        resizeCanvasBasedOnWindow();
        let canvas = p.createCanvas(cols * cellSize, rows * cellSize);
        canvas.parent('sketch-holder');
        initializeGrid();

        document.getElementById('visualizeBtn').addEventListener('click', visualize);
        document.getElementById('stopBtn').addEventListener('click', stopPathfinding);
        document.getElementById('clearBtn').addEventListener('click', clearBoard);
        document.getElementById('clearWallsBtn').addEventListener('click', clearWalls);
        document.getElementById('clearPathBtn').addEventListener('click', clearPath);
        document.getElementById('setStartBtn').addEventListener('click', () => mode = 'start');
        document.getElementById('setTargetBtn').addEventListener('click', () => mode = 'target');
        document.getElementById('setWallBtn').addEventListener('click', () => {
            mode = 'wall';
            isWallModeActive = false;
        });
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            selectedAlgorithm = e.target.value;
        });
        document.getElementById('mazeSelect').addEventListener('change', (e) => {
            if (isVisualizing) return;
            generateMaze(e.target.value);
        });
        document.getElementById('startNodeLegend').addEventListener('click', () => mode = 'start');
        document.getElementById('targetNodeLegend').addEventListener('click', () => mode = 'target');
    };

    function resizeCanvasBasedOnWindow() {
        let availableWidth = p.windowWidth - 20;
        let availableHeight = p.windowHeight - (p.windowWidth <= 768 ? 120 : 60);
        cellSize = Math.min(availableWidth / 50, availableHeight / 20, 25);
        cols = Math.floor(availableWidth / cellSize);
        rows = Math.floor(availableHeight / cellSize);
        cols = Math.max(cols, 20);
        rows = Math.max(rows, 10);
    }

    function initializeGrid() {
        grid = [];
        for (let i = 0; i < cols; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                grid[i][j] = new Node(i, j);
            }
        }
        startNode = grid[2][2];
        startNode.isStart = true;
        targetNode = grid[cols - 5][rows - 5];
        targetNode.isTarget = true;
    }

    p.windowResized = function() {
        resizeCanvasBasedOnWindow();
        p.resizeCanvas(cols * cellSize, rows * cellSize);
        initializeGrid();
    };

    p.draw = function() {
        p.background(255);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].show();
            }
        }
    };

    p.mousePressed = function() {
        if (isVisualizing) return;
        let i = p.floor(p.mouseX / cellSize);
        let j = p.floor(p.mouseY / cellSize);
        if (i >= 0 && i < cols && j >= 0 && j < rows) {
            isDragging = true;
            if (mode === 'wall') {
                isWallModeActive = true;
                addWall(i, j);
            } else {
                updateNode(i, j);
            }
        }
    };

    p.mouseDragged = function() {
        if (isVisualizing || !isDragging) return;
        let i = p.floor(p.mouseX / cellSize);
        let j = p.floor(p.mouseY / cellSize);
        if (i >= 0 && i < cols && j >= 0 && j < rows) {
            if (mode === 'wall' && isWallModeActive) {
                addWall(i, j);
            } else if (mode !== 'wall') {
                updateNode(i, j);
            }
        }
    };

    p.mouseReleased = function() {
        isDragging = false;
        if (mode === 'wall') {
            isWallModeActive = false;
        }
    };

    p.keyPressed = function() {
        if (p.key === 's' || p.key === 'S') mode = 'start';
        if (p.key === 't' || p.key === 'T') mode = 'target';
        if (p.key === 'w' || p.key === 'W') {
            mode = 'wall';
            isWallModeActive = false;
        }
    };

    function updateNode(i, j) {
        let node = grid[i][j];
        if (mode === 'start') {
            if (node.isTarget || node.isWall) return;
            startNode.isStart = false;
            startNode = node;
            startNode.isStart = true;
        } else if (mode === 'target') {
            if (node.isStart || node.isWall) return;
            targetNode.isTarget = false;
            targetNode = node;
            targetNode.isTarget = true;
        }
    }

    function addWall(i, j) {
        let node = grid[i][j];
        if (node.isStart || node.isTarget) return;
        if (!node.isWall) {
            node.isWall = true;
        }
    }

    function clearBoard() {
        if (isVisualizing) return;
        initializeGrid();
    }

    function clearWalls() {
        if (isVisualizing) return;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (!grid[i][j].isStart && !grid[i][j].isTarget) {
                    grid[i][j].isWall = false;
                }
            }
        }
    }

    function clearPath() {
        if (isVisualizing) return;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].isVisited = false;
                grid[i][j].isPath = false;
                grid[i][j].distance = Infinity;
                grid[i][j].heuristic = Infinity;
                grid[i][j].previous = null;
                grid[i][j].visitOrder = 0;
            }
        }
        visitedCount = 0;
    }

    function stopPathfinding() {
        stopVisualization = true;
    }

    async function visualize() {
        if (isVisualizing) return;
        isVisualizing = true;
        stopVisualization = false;
        document.getElementById('stopBtn').style.display = 'block';
        clearPath();
        if (selectedAlgorithm === 'dijkstra') await dijkstra();
        else if (selectedAlgorithm === 'astar') await aStar();
        else if (selectedAlgorithm === 'bfs') await bfs();
        else if (selectedAlgorithm === 'dfs') await dfs();
        else if (selectedAlgorithm === 'greedy') await greedyBestFirst();
        isVisualizing = false;
        document.getElementById('stopBtn').style.display = 'none';
    }

    async function dijkstra() {
        let unvisited = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].distance = Infinity;
                grid[i][j].previous = null;
                unvisited.push(grid[i][j]);
            }
        }
        startNode.distance = 0;
        visitedCount = 0;

        while (unvisited.length > 0) {
            if (stopVisualization) break;
            unvisited.sort((a, b) => a.distance - b.distance);
            let current = unvisited.shift();
            if (current === targetNode) break;
            if (current.distance === Infinity) break;
            if (current.isWall) continue;

            current.isVisited = true;
            current.visitOrder = visitedCount++;
            let i = current.i;
            let j = current.j;
            let neighbors = [];
            if (i > 0) neighbors.push(grid[i - 1][j]);
            if (i < cols - 1) neighbors.push(grid[i + 1][j]);
            if (j > 0) neighbors.push(grid[i][j - 1]);
            if (j < rows - 1) neighbors.push(grid[i][j + 1]);

            for (let neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    let newDist = current.distance + 1;
                    if (newDist < neighbor.distance) {
                        neighbor.distance = newDist;
                        neighbor.previous = current;
                    }
                }
            }
            await sleep(getPathfindingDelay());
        }

        if (!stopVisualization) {
            let current = targetNode;
            while (current && current.previous && !stopVisualization) {
                current.isPath = true;
                current = current.previous;
                await sleep(getPathfindingDelay());
            }
        }
    }

    async function aStar() {
        let openSet = [startNode];
        let closedSet = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].distance = Infinity;
                grid[i][j].heuristic = manhattanDistance(grid[i][j], targetNode);
                grid[i][j].previous = null;
            }
        }
        startNode.distance = 0;
        visitedCount = 0;

        while (openSet.length > 0) {
            if (stopVisualization) break;
            openSet.sort((a, b) => (a.distance + a.heuristic) - (b.distance + b.heuristic));
            let current = openSet.shift();
            if (current === targetNode) break;
            if (current.isWall) continue;

            current.isVisited = true;
            current.visitOrder = visitedCount++;
            closedSet.push(current);
            let i = current.i;
            let j = current.j;
            let neighbors = [];
            if (i > 0) neighbors.push(grid[i - 1][j]);
            if (i < cols - 1) neighbors.push(grid[i + 1][j]);
            if (j > 0) neighbors.push(grid[i][j - 1]);
            if (j < rows - 1) neighbors.push(grid[i][j + 1]);

            for (let neighbor of neighbors) {
                if (closedSet.includes(neighbor) || neighbor.isWall) continue;
                let newDist = current.distance + 1;
                if (newDist < neighbor.distance) {
                    neighbor.distance = newDist;
                    neighbor.previous = current;
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
            await sleep(getPathfindingDelay());
        }

        if (!stopVisualization && targetNode.previous) {
            let current = targetNode;
            while (current && current.previous && !stopVisualization) {
                current.isPath = true;
                current = current.previous;
                await sleep(getPathfindingDelay());
            }
        }
    }

    async function bfs() {
        let queue = [startNode];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].distance = Infinity;
                grid[i][j].previous = null;
            }
        }
        startNode.distance = 0;
        visitedCount = 0;

        while (queue.length > 0) {
            if (stopVisualization) break;
            let current = queue.shift();
            if (current === targetNode) break;
            if (current.isWall) continue;

            current.isVisited = true;
            current.visitOrder = visitedCount++;
            let i = current.i;
            let j = current.j;
            let neighbors = [];
            if (i > 0) neighbors.push(grid[i - 1][j]);
            if (i < cols - 1) neighbors.push(grid[i + 1][j]);
            if (j > 0) neighbors.push(grid[i][j - 1]);
            if (j < rows - 1) neighbors.push(grid[i][j + 1]);

            for (let neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.isVisited = true;
                    neighbor.distance = current.distance + 1;
                    neighbor.previous = current;
                    queue.push(neighbor);
                }
            }
            await sleep(getPathfindingDelay());
        }

        if (!stopVisualization) {
            let current = targetNode;
            while (current && current.previous && !stopVisualization) {
                current.isPath = true;
                current = current.previous;
                await sleep(getPathfindingDelay());
            }
        }
    }

    async function dfs() {
        let stack = [startNode];
        let visited = new Set();
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].previous = null;
                grid[i][j].isVisited = false;
            }
        }
        visitedCount = 0;

        while (stack.length > 0) {
            if (stopVisualization) break;
            let current = stack.pop();
            if (visited.has(current)) continue;
            if (current.isWall) continue;

            visited.add(current);
            current.isVisited = true;
            current.visitOrder = visitedCount++;

            if (current === targetNode) break;

            let i = current.i;
            let j = current.j;
            let neighbors = [];
            if (i > 0) neighbors.push(grid[i - 1][j]);
            if (i < cols - 1) neighbors.push(grid[i + 1][j]);
            if (j > 0) neighbors.push(grid[i][j - 1]);
            if (j < rows - 1) neighbors.push(grid[i][j + 1]);

            for (let neighbor of neighbors) {
                if (!visited.has(neighbor) && !neighbor.isWall) {
                    neighbor.previous = current;
                    stack.push(neighbor);
                }
            }
            await sleep(getPathfindingDelay());
        }

        if (!stopVisualization) {
            let current = targetNode;
            if (visited.has(targetNode)) {
                while (current && current.previous && !stopVisualization) {
                    current.isPath = true;
                    current = current.previous;
                    await sleep(getPathfindingDelay());
                }
            }
        }
    }

    async function greedyBestFirst() {
        let openSet = [startNode];
        let closedSet = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j].heuristic = manhattanDistance(grid[i][j], targetNode);
                grid[i][j].previous = null;
            }
        }
        visitedCount = 0;

        while (openSet.length > 0) {
            if (stopVisualization) break;
            openSet.sort((a, b) => a.heuristic - b.heuristic);
            let current = openSet.shift();
            if (current === targetNode) break;
            if (current.isWall) continue;

            current.isVisited = true;
            current.visitOrder = visitedCount++;
            closedSet.push(current);
            let i = current.i;
            let j = current.j;
            let neighbors = [];
            if (i > 0) neighbors.push(grid[i - 1][j]);
            if (i < cols - 1) neighbors.push(grid[i + 1][j]);
            if (j > 0) neighbors.push(grid[i][j - 1]);
            if (j < rows - 1) neighbors.push(grid[i][j + 1]);

            for (let neighbor of neighbors) {
                if (closedSet.includes(neighbor) || neighbor.isWall) continue;
                neighbor.previous = current;
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
            await sleep(getPathfindingDelay());
        }

        if (!stopVisualization) {
            let current = targetNode;
            while (current && current.previous && !stopVisualization) {
                current.isPath = true;
                current = current.previous;
                await sleep(getPathfindingDelay());
            }
        }
    }

    function manhattanDistance(nodeA, nodeB) {
        return p.abs(nodeA.i - nodeB.i) + p.abs(nodeA.j - nodeB.j);
    }

    function generateMaze(type) {
        clearBoard();
        if (type === 'recursiveDivision') recursiveDivision(0, 0, cols, rows);
        else if (type === 'randomMaze') basicRandomMaze();
        else if (type === 'stairPattern') simpleStairPattern();
    }

    function recursiveDivision(x, y, width, height) {
        if (width <= 2 || height <= 2) return;

        let vertical = width > height;
        let wallPos, passagePos;

        if (vertical) {
            wallPos = x + p.floor(p.random(1, width - 3)) + 1;
            passagePos = y + p.floor(p.random(0, height - 1));
            for (let j = y; j < y + height; j++) {
                if (j !== passagePos) {
                    let node = grid[wallPos][j];
                    if (!node.isStart && !node.isTarget) node.isWall = true;
                }
            }
            recursiveDivision(x, y, wallPos - x, height);
            recursiveDivision(wallPos + 1, y, x + width - (wallPos + 1), height);
        } else {
            wallPos = y + p.floor(p.random(1, height - 3)) + 1;
            passagePos = x + p.floor(p.random(0, width - 1));
            for (let i = x; i < x + width; i++) {
                if (i !== passagePos) {
                    let node = grid[i][wallPos];
                    if (!node.isStart && !node.isTarget) node.isWall = true;
                }
            }
            recursiveDivision(x, y, width, wallPos - y);
            recursiveDivision(x, wallPos + 1, width, y + height - (wallPos + 1));
        }
    }

    function basicRandomMaze() {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let node = grid[i][j];
                if (!node.isStart && !node.isTarget && p.random() < 0.3) {
                    node.isWall = true;
                }
            }
        }
    }

    function simpleStairPattern() {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let node = grid[i][j];
                if (!node.isStart && !node.isTarget && (i + j) % 2 === 0) {
                    node.isWall = true;
                }
            }
        }
    }

    function getPathfindingDelay() {
        switch (speed) {
            case 'veryFast': return 5;
            case 'fast': return 10;
            case 'normal': return 20;
            case 'slow': return 50;
            default: return 5;
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Sorting Visualizer
sortingSketch = function(p) {
    let values = [];
    let arraySize = 20;
    let barWidth;
    let isSorting = false;
    let stopSorting = false;
    let selectedAlgorithm = 'bubble';
    let i = 0, j = 0;
    let comparing = [-1, -1];
    let swapping = [-1, -1];
    let sortedIndices = [];
    let mergeAux = [];
    let mergeStep = 0;

    p.setup = function() {
        resizeCanvasBasedOnWindow();
        let canvas = p.createCanvas(p.windowWidth - 20, p.windowHeight - (p.windowWidth <= 768 ? 120 : 60));
        canvas.parent('sorting-sketch-holder');
        initializeArray();

        document.getElementById('sortBtn').addEventListener('click', startSorting);
        document.getElementById('stopBtn').addEventListener('click', stopSortingFunc);
        document.getElementById('resetArrayBtn').addEventListener('click', resetArray);
        document.getElementById('sortingAlgorithmSelect').addEventListener('change', (e) => {
            selectedAlgorithm = e.target.value;
        });
        document.getElementById('arraySizeSelect').addEventListener('change', (e) => {
            arraySize = parseInt(e.target.value);
            resetArray();
        });
    };

    function resizeCanvasBasedOnWindow() {
        barWidth = (p.windowWidth - 20) / arraySize;
    }

    function initializeArray() {
        values = [];
        for (let i = 0; i < arraySize; i++) {
            values.push(p.random(10, p.height - 50));
        }
        barWidth = (p.windowWidth - 20) / arraySize;
        i = 0;
        j = 0;
        comparing = [-1, -1];
        swapping = [-1, -1];
        sortedIndices = [];
        mergeAux = [];
        mergeStep = 0;
    }

    p.windowResized = function() {
        resizeCanvasBasedOnWindow();
        p.resizeCanvas(p.windowWidth - 20, p.windowHeight - (p.windowWidth <= 768 ? 120 : 60));
    };

    p.draw = function() {
        p.background(13, 26, 38);
        for (let i = 0; i < values.length; i++) {
            if (comparing.includes(i)) {
                p.fill(0, 206, 209); // Cyan for comparing
            } else if (swapping.includes(i)) {
                p.fill(218, 112, 214); // Purple for swapping
            } else if (sortedIndices.includes(i)) {
                p.fill(241, 196, 15); // Yellow for sorted
            } else {
                p.fill(236, 240, 241);
            }
            p.rect(i * barWidth, p.height - values[i], barWidth - 2, values[i]);
        }
    };

    function resetArray() {
        if (isSorting) return;
        initializeArray();
    }

    function stopSortingFunc() {
        stopSorting = true;
    }

    async function startSorting() {
        if (isSorting) return;
        isSorting = true;
        stopSorting = false;
        document.getElementById('stopBtn').style.display = 'block';
        sortedIndices = [];
        if (selectedAlgorithm === 'bubble') await bubbleSort();
        else if (selectedAlgorithm === 'selection') await selectionSort();
        else if (selectedAlgorithm === 'insertion') await insertionSort();
        else if (selectedAlgorithm === 'merge') await mergeSort(0, values.length - 1);
        else if (selectedAlgorithm === 'quick') await quickSort(0, values.length - 1);
        if (!stopSorting) {
            for (let i = 0; i < values.length; i++) {
                sortedIndices.push(i);
            }
        }
        isSorting = false;
        document.getElementById('stopBtn').style.display = 'none';
    }

    async function bubbleSort() {
        for (i = 0; i < values.length; i++) {
            for (j = 0; j < values.length - i - 1; j++) {
                if (stopSorting) break;
                comparing = [j, j + 1];
                if (values[j] > values[j + 1]) {
                    swapping = [j, j + 1];
                    [values[j], values[j + 1]] = [values[j + 1], values[j]];
                    await sleep(getSortingDelay());
                    swapping = [-1, -1];
                }
                await sleep(getSortingDelay());
                comparing = [-1, -1];
            }
            if (stopSorting) break;
            sortedIndices.push(values.length - i - 1);
        }
    }

    async function selectionSort() {
        for (i = 0; i < values.length; i++) {
            if (stopSorting) break;
            let minIdx = i;
            for (j = i + 1; j < values.length; j++) {
                if (stopSorting) break;
                comparing = [minIdx, j];
                if (values[j] < values[minIdx]) {
                    minIdx = j;
                }
                await sleep(getSortingDelay());
                comparing = [-1, -1];
            }
            swapping = [i, minIdx];
            [values[i], values[minIdx]] = [values[minIdx], values[i]];
            await sleep(getSortingDelay());
            swapping = [-1, -1];
            sortedIndices.push(i);
        }
    }

    async function insertionSort() {
        for (i = 1; i < values.length; i++) {
            if (stopSorting) break;
            let key = values[i];
            j = i - 1;
            comparing = [i, j];
            while (j >= 0 && values[j] > key) {
                if (stopSorting) break;
                values[j + 1] = values[j];
                comparing = [j, j + 1];
                await sleep(getSortingDelay());
                j--;
            }
            values[j + 1] = key;
            swapping = [j + 1];
            await sleep(getSortingDelay());
            comparing = [-1, -1];
            swapping = [-1, -1];
            sortedIndices.push(i);
        }
    }

    async function mergeSort(left, right) {
        if (left < right && !stopSorting) {
            let mid = Math.floor((left + right) / 2);
            await mergeSort(left, mid);
            await mergeSort(mid + 1, right);
            await merge(left, mid, right);
        }
    }

    async function merge(left, mid, right) {
        let leftArray = values.slice(left, mid + 1);
        let rightArray = values.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftArray.length && j < rightArray.length) {
            if (stopSorting) break;
            comparing = [left + i, mid + 1 + j];
            if (leftArray[i] <= rightArray[j]) {
                values[k] = leftArray[i];
                swapping = [k];
                i++;
            } else {
                values[k] = rightArray[j];
                swapping = [k];
                j++;
            }
            k++;
            await sleep(getSortingDelay());
            comparing = [-1, -1];
            swapping = [-1, -1];
        }

        while (i < leftArray.length && !stopSorting) {
            values[k] = leftArray[i];
            swapping = [k];
            i++;
            k++;
            await sleep(getSortingDelay());
            swapping = [-1, -1];
        }

        while (j < rightArray.length && !stopSorting) {
            values[k] = rightArray[j];
            swapping = [k];
            j++;
            k++;
            await sleep(getSortingDelay());
            swapping = [-1, -1];
        }
    }

    async function quickSort(left, right) {
        if (left < right && !stopSorting) {
            let pivotIndex = await partition(left, right);
            await quickSort(left, pivotIndex - 1);
            await quickSort(pivotIndex + 1, right);
        }
    }

    async function partition(left, right) {
        let pivot = values[right];
        let i = left - 1;

        for (let j = left; j < right; j++) {
            if (stopSorting) break;
            comparing = [j, right];
            if (values[j] <= pivot) {
                i++;
                swapping = [i, j];
                [values[i], values[j]] = [values[j], values[i]];
                await sleep(getSortingDelay());
                swapping = [-1, -1];
            }
            await sleep(getSortingDelay());
            comparing = [-1, -1];
        }

        if (!stopSorting) {
            swapping = [i + 1, right];
            [values[i + 1], values[right]] = [values[right], values[i + 1]];
            await sleep(getSortingDelay());
            swapping = [-1, -1];
        }
        return i + 1;
    }

    function getSortingDelay() {
        switch (speed) {
            case 'veryFast': return 10;
            case 'fast': return 20;
            case 'normal': return 50;
            case 'slow': return 100;
            default: return 10;
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

new p5(pathfindingSketch);
new p5(sortingSketch);