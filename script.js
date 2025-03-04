document.addEventListener('DOMContentLoaded', () => {
    // DOM selektory
    const grid = document.getElementById('grid');
    const nextGrid = document.getElementById('next-grid');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const linesDisplay = document.getElementById('lines');
    const startButton = document.getElementById('start-button');
    
    // Herní konstanty
    const GRID_WIDTH = 10;
    const GRID_HEIGHT = 20;
    const NEXT_GRID_SIZE = 4;
    
    // Herní proměnné
    let score = 0;
    let level = 1;
    let lines = 0;
    let isGameOver = false;
    let isPaused = false;
    let timerId = null;
    let dropSpeed = 1000; // Základní rychlost padání v ms (bude se snižovat s levelem)
    let isHardDropping = false;
    
    // Herní pole
    let cells = [];
    let nextCells = [];
    let gameBoard = [];
    
    // Zvukové efekty
    let soundEnabled = true;
    const sounds = {
        move: new Audio('data:audio/wav;base64,UklGRnwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVgAAABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAA=='),
        rotate: new Audio('data:audio/wav;base64,UklGRoAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVwAAACrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwA='),
        drop: new Audio('data:audio/wav;base64,UklGRpQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAAAACrAKIAmQCQAIcAfgB1AGwAYwBaAFIASQBBADkAMAApACEAGgATAAwABQD+//f/8P/p/+P/3P/V/8//yP/C/7z/tf+v/6n/o/+d/5f/kv+M/4f/gf98/3f/cv9t/2n/ZP9g/1z/WP9U/1D/TP9I/0T/'),
        line: new Audio('data:audio/wav;base64,UklGRrwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZgAAAAaACkAOABIAFcAZgB2AIUAlACkALMAwwDSAOIA8QEBAREBIAEwAUABTwFfAW8BfwGOAZ4BrQG9AcwB3AHsAfsCCwIbAisCOgJKAloCagJ6AooAigB6AGoAWgBKADoCKwIbAgsCAPsB7AHcAcwBvQGtAZ4BjgF/AW8BXwFPAUABMAEgAREBAQHxAOIA0gDDALMApACUAIUAdgBmAFcASAA4ACkAGgA='),
        levelUp: new Audio('data:audio/wav;base64,UklGRuwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YcgAAABLAEsASwBLAEsASwBcAFwAXABcAHkAeQB5AHkAkgCSAJIAkgCrAKsAqwCrAMIAwgDCAMIA2QDZANkA2QDwAPAA8ADwAAgBCAEIAQgBIAEgASABIAE3ATcBNwE3AU4BTgFOAU4BZQFlAWUBZQF8AXwBfAF8AZQBlAGUAZQBqwGrAasBqwHCASABIAEgASABCAEIAQgBCADwAPAA8ADwANkA2QDZANkAwgDCAMIAwgCrAKsAqwCrAJIAkgCSAJIAeQB5AHkAeQBcAFwAXABcAEsASwBLAEsA'),
        gameOver: new Audio('data:audio/wav;base64,UklGRvQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdAAAADSAMYAugCuAKIAlgCKAH4AcgBmAFoATgBCADYAKgAeABIA6ADcANAAxAC4AKwAoACUAIgAdgBqAF4AUgBGADoALgAiABYACgD+//L/5v/a/87/wv+2/6r/nv+S/4b/ev9u/2L/Vv9K/z7/Mv8m/xr/Dv8C//b+6v7e/tL+xv66/q7+ov6W/or+fv5y/mb+Wv5O/kL+Nv4q/h7+Ev4G/vr98v3m/dr9zv3C/bb9qv2e/ZL9hv16/W79Yv1W/Ur9Pv0y/Sb9Gv0O/QL99vzq/N78zPzA/LT8qPyc/JD8hPx4/Gz8YPxU/Ej8PPww/CQ='),
    };

    // Efekty částic
    const particles = [];
    const MAX_PARTICLES = 30;

    function setupTouchControls() {
        const touchLeft = document.getElementById('touch-left');
        const touchRight = document.getElementById('touch-right');
        const touchRotate = document.getElementById('touch-rotate');
        const touchDown = document.getElementById('touch-down');
        const touchDrop = document.getElementById('touch-drop');
        
        // Pomocné funkce pro obsluhu dotyků
        let touchTimeout = null;
        let isLongPress = false;
        
        function handleTouchStart(action) {
            // Zrušit předchozí časovač, pokud existuje
            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
            
            // Provést akci okamžitě
            action();
            
            // Nastavit dlouhý stisk pro opakování akce (u pohybů doleva, doprava a dolů)
            if (action === moveLeft || action === moveRight || action === moveDown) {
                isLongPress = false;
                touchTimeout = setTimeout(() => {
                    isLongPress = true;
                    let repeat = setInterval(() => {
                        if (isLongPress) {
                            action();
                        } else {
                            clearInterval(repeat);
                        }
                    }, 100); // Rychlost opakování
                }, 300); // Doba čekání před začátkem opakování
            }
        }
        
        function handleTouchEnd() {
            if (touchTimeout) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
            }
            isLongPress = false;
        }
        
        // Přidání event listenerů pro dotyková tlačítka
        touchLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(moveLeft);
        });
        
        touchRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(moveRight);
        });
        
        touchRotate.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(rotate);
        });
        
        touchDown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(moveDown);
        });
        
        touchDrop.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(hardDrop);
        });
        
        // Ukončení dlouhého stisku
        touchLeft.addEventListener('touchend', handleTouchEnd);
        touchRight.addEventListener('touchend', handleTouchEnd);
        touchDown.addEventListener('touchend', handleTouchEnd);
        touchRotate.addEventListener('touchend', handleTouchEnd);
        touchDrop.addEventListener('touchend', handleTouchEnd);
        
        // Zrušení výchozího chování pro dotykové události
        document.querySelectorAll('.touch-button').forEach(button => {
            button.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
        });
        
        // Detekce dotyková zařízení a zobrazení ovládacích prvků
        function isTouchDevice() {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        }
        
        if (isTouchDevice()) {
            document.getElementById('touch-controls').style.display = 'flex';
        }
    }
    
    // Vytvoření herní desky
    function createGrid() {
        grid.innerHTML = '';
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
    }
    
    // Vytvoření náhledu dalšího tetromina
    function createNextGrid() {
        nextGrid.innerHTML = '';
        nextCells = [];
        for (let row = 0; row < NEXT_GRID_SIZE; row++) {
            for (let col = 0; col < NEXT_GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                nextGrid.appendChild(cell);
                nextCells.push(cell);
            }
        }
    }
    
    // Definování tetromin
    const TETROMINOS = {
        I: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            className: 'I'
        },
        J: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'J'
        },
        L: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'L'
        },
        O: {
            shape: [
                [1, 1],
                [1, 1]
            ],
            className: 'O'
        },
        S: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            className: 'S'
        },
        T: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'T'
        },
        Z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            className: 'Z'
        }
    
    };

    
    // Nastavení tetromina
    let currentTetromino = null;
    let nextTetromino = null;
    let currentPosition = { x: 0, y: 0 };
    
    // Náhodný výběr tetromina
    function getRandomTetromino() {
        const keys = Object.keys(TETROMINOS);
        const tetroKey = keys[Math.floor(Math.random() * keys.length)];
        return { ...TETROMINOS[tetroKey], id: tetroKey };
    }
    
    // Inicializace her
    function init() {
        createGrid();
        createNextGrid();
        
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
    }
    
    // Aktualizace zobrazení skóre a dalších hodnot
    function updateDisplays() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        linesDisplay.textContent = lines;
    }
    
    // Vytvoření nového tetromina na herní desce
    function spawnTetromino() {
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
        drawNextTetromino();
        
        // Kontrola kolize při umístění - konec hry
        if (isCollision(0, 0)) {
            gameOver();
            return;
        }
        
        // Přidáme třídu spawn pro animaci nového tetromina
        draw(true);
        
        // Přehrajeme zvuk
        playSound('rotate');
    }
    
    // Přehrání zvuku
    function playSound(soundName) {
        if (!soundEnabled) return;
        
        try {
            const sound = sounds[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log("Zvuk nelze přehrát:", e));
            }
        } catch (e) {
            console.error("Chyba při přehrávání zvuku:", e);
        }
    }
    
    // Vykreslení tetromina na hrací plochu
    function draw(isNewSpawn = false) {
        // Vyčistíme předchozí pozici
        clearActiveTetromino();
        
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
                        cells[index].classList.add('tetromino', className);
                        if (isNewSpawn) {
                            cells[index].classList.add('spawn');
                            setTimeout(() => {
                                cells[index].classList.remove('spawn');
                            }, 300);
                        }
                    }
                }
            }
        }
    }
    
    // Vyčištění aktivního tetromina z hrací plochy
    function clearActiveTetromino() {
        // Pouze vyčistíme bloky, které nejsou v gameBoard (tedy jsou aktivní)
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const index = row * GRID_WIDTH + col;
                // Pokud buňka má třídu tetromino, ale v gameBoard není nic, znamená to,
                // že to je část aktivního tetromina
                if (cells[index].classList.contains('tetromino') && !gameBoard[row][col]) {
                    cells[index].classList.remove('tetromino', 'I', 'J', 'L', 'O', 'S', 'T', 'Z', 'spawn');
                }
            }
        }
    }
    
    // Vykreslení příštího tetromina v náhledu
    function drawNextTetromino() {
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
                    nextCells[index].classList.add('tetromino', className);
                }
            }
        }
    }
    
    // Kontrola kolize
    function isCollision(offsetX = 0, offsetY = 0, shape = null) {
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
    
    // Vytváření částicových efektů při smazání řádků
    function createParticles(rowIndex) {
        if (!soundEnabled) return; // Nebudeme generovat částice, pokud jsou vypnuté zvuky
        
        for (let i = 0; i < 10; i++) {
            // Vytvoříme částici pro každý sloupec v řádku
            const x = i * 30 + 15; // Středový bod buňky
            const y = rowIndex * 30 + 15;
            
            // Vytvoříme 3 částice na každou pozici
            for (let j = 0; j < 3; j++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = Math.random() * 6 + 2 + 'px';
                particle.style.height = Math.random() * 6 + 2 + 'px';
                particle.style.backgroundColor = getRandomColor();
                particle.style.borderRadius = '50%';
                particle.style.top = y + 'px';
                particle.style.left = x + 'px';
                particle.style.zIndex = '10';
                particle.style.opacity = '1';
                particle.style.pointerEvents = 'none';
                
                // Nastavíme náhodnou dráhu
                const angle = Math.random() * Math.PI * 2; // 0 až 2π
                const speed = Math.random() * 3 + 2;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                
                grid.appendChild(particle);
                
                particles.push({
                    element: particle,
                    x: x,
                    y: y,
                    vx: vx,
                    vy: vy,
                    gravity: 0.1,
                    life: 100, // Životnost částice
                    opacity: 1
                });
            }
        }
    }
    
    // Získání náhodné barvy pro částice
    function getRandomColor() {
        const colors = ['#00ffff', '#0080ff', '#ff8000', '#ffff00', '#00ff80', '#c000ff', '#ff0050'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Aktualizace částic
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Pohyb částice
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= 1;
            p.opacity = p.life / 100;
            
            // Aktualizace zobrazení
            p.element.style.left = p.x + 'px';
            p.element.style.top = p.y + 'px';
            p.element.style.opacity = p.opacity;
            
            // Odstranění částice po vypršení životnosti
            if (p.life <= 0) {
                p.element.remove();
                particles.splice(i, 1);
            }
        }
        
        // Omezení počtu částic
        if (particles.length > MAX_PARTICLES) {
            for (let i = 0; i < particles.length - MAX_PARTICLES; i++) {
                particles[0].element.remove();
                particles.shift();
            }
        }
    }
    
    // Uložení tetromina na hrací plochu
    function placeTetromino() {
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
        renderGameBoard();
        
        // Kontrola dokončených řádků
        if (pieceAddedToBoard) {
            checkRows();
            spawnTetromino();
        }
    }
    
    // Vykreslení bloků z gameBoard (statické bloky, které již byly umístěny)
    function renderGameBoard() {
        // Vyčistíme celou plochu
        for (let cell of cells) {
            cell.classList.remove('tetromino', 'I', 'J', 'L', 'O', 'S', 'T', 'Z', 'flash', 'spawn');
        }
        
        // Vykreslíme bloky z gameBoard
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                if (gameBoard[row][col]) {
                    const index = row * GRID_WIDTH + col;
                    cells[index].classList.add('tetromino', gameBoard[row][col]);
                }
            }
        }
        
        // Pokud máme aktivní tetromino, vykreslíme ho
        if (currentTetromino) {
            draw();
        }
    }
    
    // Pohyb tetromina dolů
    function moveDown() {
        if (isPaused || isGameOver) return;
        
        if (!isCollision(0, 1)) {
            currentPosition.y++;
            draw();
            return true;
        } else {
            // Uložíme tetromino do gameBoard, pokud je kolize
            placeTetromino();
            return false;
        }
    }
    
    // Pohyb tetromina doleva
    function moveLeft() {
        if (isPaused || isGameOver) return;
        
        if (!isCollision(-1, 0)) {
            currentPosition.x--;
            draw();
            playSound('move');
        }
    }
    
    // Pohyb tetromina doprava
    function moveRight() {
        if (isPaused || isGameOver) return;
        
        if (!isCollision(1, 0)) {
            currentPosition.x++;
            draw();
            playSound('move');
        }
    }
    
    // Rotace tetromina
    function rotate() {
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
            draw();
            playSound('rotate');
        }
    }
    
    // Hard drop - rychlé umístění tetromina na dno
    function hardDrop() {
        if (isPaused || isGameOver) return;
        
        let dropDistance = 0;
        while (!isCollision(0, dropDistance + 1)) {
            dropDistance++;
        }
        
        // Animace hard drop
        isHardDropping = true;
        grid.classList.add('hard-drop');
        
        currentPosition.y += dropDistance;
        draw();
        
        // Přidáme body za hard drop
        score += dropDistance;
        updateDisplays();
        
        placeTetromino();
    }
    
    // Kontrola dokončených řádků
    function checkRows() {
        let completedRows = 0;
        let rowsToCheck = [];
        
        // Identifikace všech dokončených řádků
        for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
            if (gameBoard[row].every(cell => cell !== 0)) {
                rowsToCheck.push(row);
                completedRows++;
                
                // Vytvoříme částicové efekty
                createParticles(row);
                
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
                renderGameBoard();
            }, 300);
        }
    }
    
    // Aktualizace skóre
    function updateScore(completedRows) {
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
    
    // Pauza hry
    function togglePause() {
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
    
    // Konec hry
    function gameOver() {
        isGameOver = true;
        clearInterval(timerId);
        timerId = null;
        grid.classList.add('game-over');
        startButton.textContent = 'Restart';
        
        // Přehrajeme zvuk pro konec hry
        playSound('gameOver');
    }
    
    // Start hry
    function startGame() {
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
    
    // Herní smyčka pro aktualizaci částic
    function gameLoop() {
        updateParticles();
        requestAnimationFrame(gameLoop);
    }
    
    // Spustíme herní smyčku
    gameLoop();
    
    // Event Listenery
    document.addEventListener('keydown', (e) => {
        if (isGameOver) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
            case ' ':
                hardDrop();
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
            case 'm':
            case 'M':
                // Zapnout/vypnout zvuk
                soundEnabled = !soundEnabled;
                break;
        }
    });
    
    startButton.addEventListener('click', () => {
        if (isGameOver) {
            grid.classList.remove('game-over');
            init();
        }
        startGame();
    });
    
    // Inicializace hry
    init();
    
    // Automatické spuštění hry po načtení stránky
    // Toto opraví problém s padáním bloků
    setupTouchControls();
    startGame();
});