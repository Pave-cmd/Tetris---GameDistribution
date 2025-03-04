import { GRID_WIDTH, GRID_HEIGHT, NEXT_GRID_SIZE } from './constants.js';

// Globální proměnné pro UI prvky
export let cells = [];
export let nextCells = [];
export let grid = null;
export let nextGrid = null;

// Vytvoření herní desky
export function createGrid(gridElement) {
    grid = gridElement;
    grid.innerHTML = '';
    
    // Nastavení CSS grid pro herní plochu
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 30px)`;
    grid.style.gridTemplateRows = `repeat(${GRID_HEIGHT}, 30px)`;
    grid.style.gap = '2px';
    grid.style.backgroundColor = 'rgba(10, 10, 30, 0.8)';
    grid.style.borderRadius = '8px';
    grid.style.overflow = 'hidden';
    grid.style.boxShadow = 'inset 0 0 15px rgba(0, 0, 0, 0.6)';
    grid.style.position = 'relative';
    
    // Přidáme element pro efekt rychlosti
    const speedLines = document.createElement('div');
    speedLines.classList.add('speed-lines');
    grid.appendChild(speedLines);
    
    cells = [];
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            grid.appendChild(cell);
            cells.push(cell);
        }
    }
    
    console.log(`Vytvořeno ${cells.length} buněk pro herní plochu`);
}

// Vytvoření náhledu dalšího tetromina
export function createNextGrid(nextGridElement) {
    nextGrid = nextGridElement;
    nextGrid.innerHTML = '';
    
    // Nastavení CSS grid pro náhled dalšího tetromina
    nextGrid.style.display = 'grid';
    nextGrid.style.gridTemplateColumns = `repeat(${NEXT_GRID_SIZE}, 25px)`;
    nextGrid.style.gridTemplateRows = `repeat(${NEXT_GRID_SIZE}, 25px)`;
    nextGrid.style.gap = '2px';
    nextGrid.style.backgroundColor = 'rgba(10, 10, 30, 0.5)';
    nextGrid.style.padding = '8px';
    nextGrid.style.marginTop = '10px';
    nextGrid.style.borderRadius = '8px';
    nextGrid.style.justifyContent = 'center';
    
    nextCells = [];
    for (let row = 0; row < NEXT_GRID_SIZE; row++) {
        for (let col = 0; col < NEXT_GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            nextGrid.appendChild(cell);
            nextCells.push(cell);
        }
    }
    
    console.log(`Vytvořeno ${nextCells.length} buněk pro náhled`);
}

// Vykreslení tetromina na hrací plochu
export function drawTetromino(currentTetromino, currentPosition, gameBoard, isNewSpawn = false) {
    // Vyčistíme předchozí pozici
    clearActiveTetromino(gameBoard);
    
    // Poté vykreslíme tetromino na nové pozici
    const shape = currentTetromino.shape;
    const className = currentTetromino.className;
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const x = currentPosition.x + col;
                const y = currentPosition.y + row;
                
                // Kreslíme pouze na platné pozice
                if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
                    const index = y * GRID_WIDTH + x;
                    if (index >= 0 && index < cells.length) {
                        cells[index].classList.add('tetromino', className);
                        if (isNewSpawn) {
                            cells[index].classList.add('spawn');
                            setTimeout(() => {
                                if (cells[index]) { // Kontrola, zda buňka ještě existuje
                                    cells[index].classList.remove('spawn');
                                }
                            }, 300);
                        }
                    }
                }
            }
        }
    }
}

// Vyčištění aktivního tetromina z hrací plochy
export function clearActiveTetromino(gameBoard) {
    // Pouze vyčistíme bloky, které nejsou v gameBoard (tedy jsou aktivní)
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const index = row * GRID_WIDTH + col;
            if (index >= 0 && index < cells.length) {
                // Pokud buňka má třídu tetromino, ale v gameBoard není nic, znamená to,
                // že to je část aktivního tetromina
                if (cells[index].classList.contains('tetromino') && !gameBoard[row][col]) {
                    cells[index].classList.remove('tetromino', 'I', 'J', 'L', 'O', 'S', 'T', 'Z', 'spawn');
                }
            }
        }
    }
}

// Vykreslení příštího tetromina v náhledu
export function drawNextTetromino(nextTetromino) {
    if (!nextTetromino || !nextCells.length) return;
    
    // Vyčištění náhledu
    for (let cell of nextCells) {
        cell.classList.remove('tetromino', 'I', 'J', 'L', 'O', 'S', 'T', 'Z');
    }
    
    const shape = nextTetromino.shape;
    const className = nextTetromino.className;
    
    // Centrování tvaru v náhledu
    const offsetX = Math.floor((NEXT_GRID_SIZE - shape[0].length) / 2);
    const offsetY = Math.floor((NEXT_GRID_SIZE - shape.length) / 2);
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const x = offsetX + col;
                const y = offsetY + row;
                const index = y * NEXT_GRID_SIZE + x;
                if (index >= 0 && index < nextCells.length) {
                    nextCells[index].classList.add('tetromino', className);
                }
            }
        }
    }
}

// Vykreslení bloků z gameBoard (statické bloky, které již byly umístěny)
export function renderGameBoard(gameBoard, currentTetromino, currentPosition) {
    if (!cells.length) return;
    
    // Vyčistíme celou plochu
    for (let cell of cells) {
        cell.classList.remove('tetromino', 'I', 'J', 'L', 'O', 'S', 'T', 'Z', 'flash', 'spawn');
    }
    
    // Vykreslíme bloky z gameBoard
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            if (gameBoard[row][col]) {
                const index = row * GRID_WIDTH + col;
                if (index >= 0 && index < cells.length) {
                    cells[index].classList.add('tetromino', gameBoard[row][col]);
                }
            }
        }
    }
    
    // Pokud máme aktivní tetromino, vykreslíme ho
    if (currentTetromino) {
        drawTetromino(currentTetromino, currentPosition, gameBoard);
    }
}