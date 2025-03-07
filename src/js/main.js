import { updateParticles } from './particles.js';
import { createGrid, createNextGrid } from './render.js';
import { 
    init, 
    initDisplays, 
    startGame,
    gameOver as gameOverFunction,
    togglePause,
    pause,  // Přidáno
    resume  // Přidáno
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
    
    // Zpřístupnění funkcí pro GameDistribution SDK
    window.togglePause = togglePause;
    window.startGame = startGame;
    window.pauseGame = pause;    // Přidáno
    window.resumeGame = resume;  // Přidáno
    
    // Přepíšeme funkci gameOver, abychom mohli změnit text tlačítka a zobrazit reklamu
    const originalGameOver = gameOverFunction;
    window.gameOver = function() {
        originalGameOver();
        startButton.textContent = 'Restart';
        
        // Zobrazení reklamy při Game Over s malým zpožděním pro lepší UX
        setTimeout(() => {
            if (typeof gdsdk !== 'undefined' && typeof gdsdk.showAd === 'function') {
                try {
                    gdsdk.showAd().catch(error => {
                        console.error("Chyba při zobrazení reklamy:", error);
                    });
                } catch (e) {
                    console.error("Chyba při zobrazení reklamy:", e);
                }
            }
        }, 1000);
    };
    
    // Inicializace ovládání
    setupKeyboardControls();
    setupTouchControls();
    
    // Inicializace hry
    init();
    
    // Event listener pro start button s reklamou
    startButton.addEventListener('click', () => {
        // Zkontrolujeme dostupnost GameDistribution SDK
        if (typeof gdsdk !== 'undefined' && typeof gdsdk.showAd === 'function') {
            // Zobrazit reklamu
            gdsdk.showAd().then(() => {
                // Po reklamě pokračovat s hrou
                handleGameButtonClick();
            }).catch((error) => {
                // V případě chyby reklamy, pokračovat s hrou
                console.error("Chyba reklamy:", error);
                handleGameButtonClick();
            });
        } else {
            // Pokud SDK není k dispozici, pokračovat normálně
            handleGameButtonClick();
        }
    });
    
    function handleGameButtonClick() {
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
    }
    
    // Herní smyčka pro aktualizaci částic
    function gameLoop() {
        updateParticles();
        requestAnimationFrame(gameLoop);
    }
    
    // Spustíme herní smyčku
    gameLoop();
    
    // Načtení a zobrazení úvodní reklamy při startu hry
    if (typeof gdsdk !== 'undefined' && typeof gdsdk.showAd === 'function') {
        try {
            // Zobrazíme úvodní reklamu
            gdsdk.showAd().catch(error => {
                console.log("Reklama nebyla zobrazena:", error);
                // Pokračovat ve hře i když reklama selže
                startGame();
            });
        } catch (e) {
            console.error("Chyba při zobrazení reklamy:", e);
            startGame();
        }
    } else {
        // Pokud SDK není k dispozici, spustíme hru normálně
        startGame();
    }
    
    console.log("Hra inicializována");
});