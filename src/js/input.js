import { moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause } from './game.js';
import { toggleSound } from './sounds.js';

// Nastavení ovládání klávesnicí
export function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
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
                toggleSound();
                break;
        }
    });
}

// Nastavení dotykového ovládání
export function setupTouchControls() {
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