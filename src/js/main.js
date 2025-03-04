import { updateParticles } from './particles.js';
import { createGrid, createNextGrid } from './render.js';
import { 
    init, 
    initDisplays, 
    startGame,
    gameOver as gameOverFunction,
    togglePause
} from './game.js';
import { setupKeyboardControls, setupTouchControls } from './input.js';

// Hlavní funkce po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM načten, inicializace hry...");
    
    // DOM selektory
    const grid = document.getElementById('grid');
    const nextGrid = document.getElementById('next-grid');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const linesDisplay = document.getElementById('lines');
    const startButton = document.getElementById('start-button');
    
    console.log("Grid element:", grid);
    console.log("Next Grid element:", nextGrid);
    
    // Inicializace herní plochy
    createGrid(grid);
    createNextGrid(nextGrid);
    
    // Inicializace displejů
    initDisplays(scoreDisplay, levelDisplay, linesDisplay);
    
    // Přepíšeme funkci gameOver, abychom mohli změnit text tlačítka
    const originalGameOver = gameOverFunction;
    window.gameOver = function() {
        originalGameOver();
        startButton.textContent = 'Restart';
    };
    
    // Inicializace ovládání
    setupKeyboardControls();
    setupTouchControls();
    
    // Inicializace hry
    init();
    
    // Event listener pro start button
    startButton.addEventListener('click', () => {
        if (grid.classList.contains('game-over')) {
            grid.classList.remove('game-over');
            init();
            startButton.textContent = 'Pauza';
        } else if (grid.classList.contains('paused')) {
            startButton.textContent = 'Pauza';
            togglePause();
        } else {
            startButton.textContent = 'Pokračovat';
            togglePause();
        }
        startGame();
    });
    
    // Herní smyčka pro aktualizaci částic
    function gameLoop() {
        updateParticles();
        requestAnimationFrame(gameLoop);
    }
    
    // Spustíme herní smyčku
    gameLoop();
    
    // Automatické spuštění hry po načtení stránky
    startGame();
    
    console.log("Hra inicializována");
});