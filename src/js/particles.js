import { MAX_PARTICLES } from './constants.js';
import { soundEnabled } from './sounds.js';

// Efekty částic
export const particles = [];

// Vytváření částicových efektů při smazání řádků
export function createParticles(rowIndex, grid) {
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
export function updateParticles() {
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