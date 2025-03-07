import { GRID_WIDTH, GRID_HEIGHT } from './constants.js';
import { getRandomTetromino } from './tetrominos.js';
import { playSound } from './sounds.js';
import { createParticles } from './particles.js';
import { 
    drawTetromino, 
    drawNextTetromino, 
    renderGameBoard, 
    grid, 
    cells 
} from './render.js';

// Herní proměnné
export let score = 0;
export let level = 1;
export let lines = 0;
export let isGameOver = false;
export let isPaused = false;
export let timerId = null;
export let dropSpeed = 1000; // Základní rychlost padání v ms
export let isHardDropping = false;
export let gameBoard = [];
export let currentTetromino = null;
export let nextTetromino = null;
export let currentPosition = { x: 0, y: 0 };
export let scoreDisplay, levelDisplay, linesDisplay;

// Inicializace proměnných displeje
export function initDisplays(scoreEl, levelEl, linesEl) {
    scoreDisplay = scoreEl;
    levelDisplay = levelEl;
    linesDisplay = linesEl;
}

// Kontrola kolize
export function isCollision(offsetX = 0, offsetY = 0, shape = null) {
    const tetrominoShape = shape || currentTetromino.shape;
    
    for (let row = 0; row < tetrominoShape.length; row++) {
        for (let col = 0; col < tetrominoShape[row].length; col++) {
            if (tetrominoShape[row][col]) {
                const x = currentPosition.x + col + offsetX;
                const y = currentPosition.y + row + offsetY;
                
                // Kontrola hranic desky
                if (y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) {
                    return true;
                }
                
                // Pokud jsme nad herní deskou, kontrolu přeskočíme
                if (y < 0) {
                    continue;
                }
                
                // Kontrola kolize s jinými tetrominy
                if (gameBoard[y][x]) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Konec hry
export function gameOver() {
    isGameOver = true;
    clearInterval(timerId);
    timerId = null;
    grid.classList.add('game-over');
    
    // Přehrajeme zvuk pro konec hry
    playSound('gameOver');
    
    // Zobrazení mezirolové reklamy na konci hry
    if (typeof gdsdk !== 'undefined' && typeof gdsdk.showAd === 'function') {
        setTimeout(() => {
            gdsdk.showAd().catch((error) => {
                console.error("Chyba reklamy při Game Over:", error);
            });
        }, 1000); // Malé zpoždění pro lepší UX
    }
    
    // Pokud je dostupná globální funkce gameOver (z main.js), voláme ji
    if (typeof window.gameOver === 'function') {
        window.gameOver();
    }
}

// Aktualizace zobrazení skóre a dalších hodnot
export function updateDisplays() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    linesDisplay.textContent = lines;
}

// Vytvoření nového tetromina na herní desce
export function spawnTetromino() {
    if (!nextTetromino) {
        nextTetromino = getRandomTetromino();
    }
    
    currentTetromino = nextTetromino;
    nextTetromino = getRandomTetromino();
    
    // Umístění nového tetromina nahoře uprostřed
    const width = currentTetromino.shape[0].length;
    currentPosition = {
        x: Math.floor((GRID_WIDTH - width) / 2),
        y: 0
    };
    
    // Zobrazení dalšího tetromina v náhledu
    drawNextTetromino(nextTetromino);
    
    // Kontrola kolize při umístění - konec hry
    if (isCollision(0, 0)) {
        gameOver();
        return;
    }
    
    // Přidáme třídu spawn pro animaci nového tetromina
    drawTetromino(currentTetromino, currentPosition, gameBoard, true);
    
    // Přehrajeme zvuk
    playSound('rotate');
}

// Inicializace hry
export function init() {
    // Vytvoříme nové herní pole
    gameBoard = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
        gameBoard.push(Array(GRID_WIDTH).fill(0));
    }
    
    score = 0;
    level = 1;
    lines = 0;
    isGameOver = false;
    isPaused = false;
    
    updateDisplays();
    
    nextTetromino = getRandomTetromino();
    spawnTetromino();
    
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    dropSpeed = 1000 - (level - 1) * 50; // Rychlost se zvyšuje s levelem
    
    return {
        gameBoard,
        score,
        level,
        lines,
        isGameOver,
        isPaused,
        dropSpeed,
        currentTetromino,
        nextTetromino,
        currentPosition
    };
}

// Uložení tetromina na hrací plochu
export function placeTetromino() {
    if (!currentTetromino) return;
    
    const shape = currentTetromino.shape;
    const className = currentTetromino.className;
    
    let pieceAddedToBoard = false;
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const x = currentPosition.x + col;
                const y = currentPosition.y + row;
                
                // Pokud je tetromino nad herní deskou, ignorujeme
                if (y < 0) continue;
                
                // Pouze pokud je v hranicích
                if (y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
                    gameBoard[y][x] = className;
                    pieceAddedToBoard = true;
                }
            }
        }
    }
    
    // Přehrajeme zvuk umístění
    playSound('drop');
    
    // Vypneme efekt hard drop
    isHardDropping = false;
    grid.classList.remove('hard-drop');
    
    // Vykreslíme statické bloky z gameBoard
    renderGameBoard(gameBoard, currentTetromino, currentPosition);
    
    // Kontrola dokončených řádků
    if (pieceAddedToBoard) {
        checkRows();
        spawnTetromino();
    }
}

// Rotace tetromina
export function rotate() {
    if (isPaused || isGameOver) return;
    
    const shape = currentTetromino.shape;
    const size = shape.length;
    const newShape = Array(size).fill().map(() => Array(size).fill(0));
    
    // Rotace matice
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            newShape[col][size - 1 - row] = shape[row][col];
        }
    }
    
    // Pokud není kolize s novou rotací, použijeme ji
    if (!isCollision(0, 0, newShape)) {
        currentTetromino.shape = newShape;
        drawTetromino(currentTetromino, currentPosition, gameBoard);
        playSound('rotate');
    }
}

// Hard drop - rychlé umístění tetromina na dno
export function hardDrop() {
    if (isPaused || isGameOver) return;
    
    let dropDistance = 0;
    while (!isCollision(0, dropDistance + 1)) {
        dropDistance++;
    }
    
    // Animace hard drop
    isHardDropping = true;
    grid.classList.add('hard-drop');
    
    currentPosition.y += dropDistance;
    drawTetromino(currentTetromino, currentPosition, gameBoard);
    
    // Přidáme body za hard drop
    score += dropDistance;
    updateDisplays();
    
    placeTetromino();
}

// Pauza hry
export function togglePause() {
    if (isGameOver) {
        // Restart hry, pokud je hra ukončena
        init();
        startGame();
        return;
    }
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(timerId);
        timerId = null;
        grid.classList.add('paused');
    } else {
        timerId = setInterval(moveDown, dropSpeed);
        grid.classList.remove('paused');
    }
}

// Přidáme nové funkce speciálně pro SDK
export function pause() {
    if (!isPaused && !isGameOver) {
        isPaused = true;
        clearInterval(timerId);
        timerId = null;
        grid.classList.add('paused');
    }
}

export function resume() {
    if (isPaused && !isGameOver) {
        isPaused = false;
        timerId = setInterval(moveDown, dropSpeed);
        grid.classList.remove('paused');
    }
}

// Start hry
export function startGame() {
    if (!isGameOver && !isPaused) {
        // První start - zajistit, že existuje pouze jeden interval
        if (timerId) {
            clearInterval(timerId);
        }
        timerId = setInterval(moveDown, dropSpeed);
        console.log("Hra spuštěna, interval nastaven:", dropSpeed, "ms");
    } else {
        // Toggle pauzy nebo restart
        togglePause();
    }
}

// Kontrola dokončených řádků
export function checkRows() {
    let completedRows = 0;
    let rowsToCheck = [];
    
    // Identifikace všech dokončených řádků
    for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
        if (gameBoard[row].every(cell => cell !== 0)) {
            rowsToCheck.push(row);
            completedRows++;
            
            // Vytvoříme částicové efekty
            createParticles(row, grid);
            
            // Vizuální efekt pro dokončené řádky
            for (let col = 0; col < GRID_WIDTH; col++) {
                const index = row * GRID_WIDTH + col;
                cells[index].classList.add('flash');
            }
        }
    }
    
    if (rowsToCheck.length > 0) {
        // Přehrajeme zvuk pro kompletní řádky
        playSound('line');
        
        // Odložíme odstranění řádků kvůli animaci
        setTimeout(() => {
            rowsToCheck.forEach(row => {
                // Odstraníme řádek z herního pole
                for (let y = row; y > 0; y--) {
                    for (let x = 0; x < GRID_WIDTH; x++) {
                        gameBoard[y][x] = gameBoard[y - 1][x];
                    }
                }
                
                // Vyčistíme horní řádek
                for (let x = 0; x < GRID_WIDTH; x++) {
                    gameBoard[0][x] = 0;
                }
            });
            
            // Aktualizace skóre a zobrazení
            updateScore(completedRows);
            renderGameBoard(gameBoard, currentTetromino, currentPosition);
        }, 300);
    }
}

// Aktualizace skóre
export function updateScore(completedRows) {
    // Různé bodování podle počtu odstraněných řádků najednou
    const points = [40, 100, 300, 1200]; // 1, 2, 3, 4 řádky
    score += points[completedRows - 1] * level;
    
    // Aktualizace počtu řádků a kontrola nového levelu
    lines += completedRows;
    const oldLevel = level;
    level = Math.floor(lines / 10) + 1;
    
    // Kontrola, zda došlo ke zvýšení úrovně
    if (level > oldLevel) {
        levelDisplay.classList.add('level-up');
        setTimeout(() => {
            levelDisplay.classList.remove('level-up');
        }, 1000);
        
        // Zvýšení rychlosti s každým novým levelem
        clearInterval(timerId);
        dropSpeed = Math.max(100, 1000 - (level - 1) * 50);
        
        // Přehrajeme zvuk pro nový level
        playSound('levelUp');
        
        if (!isPaused) {
            timerId = setInterval(moveDown, dropSpeed);
        }
    }
    
    // Aktualizace zobrazení
    updateDisplays();
}

// Pohyb tetromina dolů
export function moveDown() {
    if (isPaused || isGameOver) return;
    
    if (!isCollision(0, 1)) {
        currentPosition.y++;
        drawTetromino(currentTetromino, currentPosition, gameBoard);
        return true;
    } else {
        // Uložíme tetromino do gameBoard, pokud je kolize
        placeTetromino();
        return false;
    }
}

// Pohyb tetromina doleva
export function moveLeft() {
    if (isPaused || isGameOver) return;
    
    if (!isCollision(-1, 0)) {
        currentPosition.x--;
        drawTetromino(currentTetromino, currentPosition, gameBoard);
        playSound('move');
    }
}

// Pohyb tetromina doprava
export function moveRight() {
    if (isPaused || isGameOver) return;
    
    if (!isCollision(1, 0)) {
        currentPosition.x++;
        drawTetromino(currentTetromino, currentPosition, gameBoard);
        playSound('move');
    }
}