// Definování tetromin
export const TETROMINOS = {
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

// Náhodný výběr tetromina
export function getRandomTetromino() {
    const keys = Object.keys(TETROMINOS);
    const tetroKey = keys[Math.floor(Math.random() * keys.length)];
    return { ...TETROMINOS[tetroKey], id: tetroKey };
}