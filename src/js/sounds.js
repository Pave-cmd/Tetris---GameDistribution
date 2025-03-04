// Zvukové efekty
export let soundEnabled = true;
export const sounds = {
    move: new Audio('data:audio/wav;base64,UklGRnwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVgAAABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAA=='),
    rotate: new Audio('data:audio/wav;base64,UklGRoAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVwAAACrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwCrAKsAqwA='),
    drop: new Audio('data:audio/wav;base64,UklGRpQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAAAACrAKIAmQCQAIcAfgB1AGwAYwBaAFIASQBBADkAMAApACEAGgATAAwABQD+//f/8P/p/+P/3P/V/8//yP/C/7z/tf+v/6n/o/+d/5f/kv+M/4f/gf98/3f/cv9t/2n/ZP9g/1z/WP9U/1D/TP9I/0T/'),
    line: new Audio('data:audio/wav;base64,UklGRrwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZgAAAAaACkAOABIAFcAZgB2AIUAlACkALMAwwDSAOIA8QEBAREBIAEwAUABTwFfAW8BfwGOAZ4BrQG9AcwB3AHsAfsCCwIbAisCOgJKAloCagJ6AooAigB6AGoAWgBKADoCKwIbAgsCAPsB7AHcAcwBvQGtAZ4BjgF/AW8BXwFPAUABMAEgAREBAQHxAOIA0gDDALMApACUAIUAdgBmAFcASAA4ACkAGgA='),
    levelUp: new Audio('data:audio/wav;base64,UklGRuwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YcgAAABLAEsASwBLAEsASwBcAFwAXABcAHkAeQB5AHkAkgCSAJIAkgCrAKsAqwCrAMIAwgDCAMIA2QDZANkA2QDwAPAA8ADwAAgBCAEIAQgBIAEgASABIAE3ATcBNwE3AU4BTgFOAU4BZQFlAWUBZQF8AXwBfAF8AZQBlAGUAZQBqwGrAasBqwHCASABIAEgASABCAEIAQgBCADwAPAA8ADwANkA2QDZANkAwgDCAMIAwgCrAKsAqwCrAJIAkgCSAJIAeQB5AHkAeQBcAFwAXABcAEsASwBLAEsA'),
    gameOver: new Audio('data:audio/wav;base64,UklGRvQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdAAAADSAMYAugCuAKIAlgCKAH4AcgBmAFoATgBCADYAKgAeABIA6ADcANAAxAC4AKwAoACUAIgAdgBqAF4AUgBGADoALgAiABYACgD+//L/5v/a/87/wv+2/6r/nv+S/4b/ev9u/2L/Vv9K/z7/Mv8m/xr/Dv8C//b+6v7e/tL+xv66/q7+ov6W/or+fv5y/mb+Wv5O/kL+Nv4q/h7+Ev4G/vr98v3m/dr9zv3C/bb9qv2e/ZL9hv16/W79Yv1W/Ur9Pv0y/Sb9Gv0O/QL99vzq/N78zPzA/LT8qPyc/JD8hPx4/Gz8YPxU/Ej8PPww/CQ=')
};

// Přehrání zvuku
export function playSound(soundName) {
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

// Přepínání zvuku
export function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}