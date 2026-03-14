const BACKGROUND = "#101010";
const FOREGROUND = "#50FF50";

console.log(game)
game.width = 1100
game.height = 1100
const ctx = game.getContext("2d")
console.log(ctx)

function clear() {
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, game.width, game.height)
}

function point({x, y}) {
    const s = 20;
    ctx.fillStyle = FOREGROUND;
    ctx.fillRect(x - (s / 2), y - (s / 2), s, s);
}

function line(p1, p2) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = FOREGROUND;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function gridLine(p1, p2) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1a591a";
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function screen(p) {
    return {
        x: (p.x + 1)/2*game.width,
        y: (1 - (p.y + 1)/2)*game.height,
    }
}

function project({x, y, z}) {
    return {
        x: x/z,
        y: y/z,
    }
}

const FPS = 60;

function translate_z({x,y,z}, dz) {
    return { x, y, z: z + dz }
}

function rotate_x({x,y,z}, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x, y: y*c-z*s, z: y*s+z*c }
}

function rotate_y({x, y, z}, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: x*c-z*s, y, z: x*s+z*c }
}

let dz = 15;
let activeRot = { axis: null, target: 0, current: 0 };

function rotatePoint(p, axis, angle) {
    return axis === 'x' ? rotate_x(p, angle) : rotate_y(p, angle);
}

function transform(p) {
    let p_rot = p;
    if (activeRot.axis) {
        p_rot = rotatePoint(p, activeRot.axis, activeRot.current);
    }
    return translate_z(p_rot, dz);
}

function applyPermanentRotation() {
    let axis = activeRot.axis;
    let angle = activeRot.target;
    
    function fixInt(p) { return { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) }; }
    function fixFloat(p) { return { x: parseFloat(p.x.toFixed(3)), y: parseFloat(p.y.toFixed(3)), z: parseFloat(p.z.toFixed(3)) }; }

    for(let i=0; i<boxVs.length; i++) boxVs[i] = fixFloat(rotatePoint(boxVs[i], axis, angle));
    for(let i=0; i<gridLines.length; i++) {
        gridLines[i][0] = fixFloat(rotatePoint(gridLines[i][0], axis, angle));
        gridLines[i][1] = fixFloat(rotatePoint(gridLines[i][1], axis, angle));
    }
    for(let i=0; i<snake.length; i++) snake[i] = fixInt(rotatePoint(snake[i], axis, angle));
    
    apple = fixInt(rotatePoint(apple, axis, angle));
    snakeDir = fixInt(rotatePoint(snakeDir, axis, angle)); 

    activeRot.axis = null;
}
// ----------------------------------------

let snakeDir = {x: 0, y: 0, z: 0};
let lastMoveTime = 0;
const MOVE_INTERVAL = 300;
let inputQueue = [];
let canChangeDir = true;
let snake = [ {x: 0, y: 0, z: 0}];

function snakeSegment({x, y, z}, isHead = false) {
    const s = 1.0;
    const boxVs = [
        {x: x - s / 2, y: y - s / 2, z: z - s / 2}, {x: x + s / 2, y: y - s / 2, z: z - s / 2}, {x: x + s / 2, y: y + s / 2, z: z - s / 2}, {x: x - s / 2, y: y + s / 2, z: z - s / 2},
        {x: x - s / 2, y: y - s / 2, z: z + s / 2}, {x: x + s / 2, y: y - s / 2, z: z + s / 2}, {x: x + s / 2, y: y + s / 2, z: z + s / 2}, {x: x - s / 2, y: y + s / 2, z: z + s / 2}
    ];
    const boxFs = [
        [0, 1, 2, 3], [4, 5, 6, 7], [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    
    ctx.strokeStyle = isHead ? "#FF5050" : FOREGROUND; 
    ctx.lineWidth = isHead ? 4 : 2; 

    for(let f of boxFs) {
        ctx.beginPath();
        for(let i = 0; i < f.length; i++){
            const a = boxVs[f[i]];
            const b = boxVs[f[(i+1)%f.length]];
            
            let projA = screen(project(transform(a)));
            let projB = screen(project(transform(b)));
            
            ctx.moveTo(projA.x, projA.y);
            ctx.lineTo(projB.x, projB.y);
        }
        ctx.stroke();
    }
}

const gridLines = [];
const step = 1;
const S = 5.5;

for(let i = -S + step; i < S; i += step) {
    gridLines.push([{x: i, y: -S, z: -S}, {x: i, y: -S, z: S}]);
    gridLines.push([{x: -S, y: -S, z: i}, {x: S, y: -S, z: i}]);
    gridLines.push([{x: i, y: S, z: -S}, {x: i, y: S, z: S}]);
    gridLines.push([{x: -S, y: S, z: i}, {x: S, y: S, z: i}]);

    gridLines.push([{x: -S, y: i, z: -S}, {x: -S, y: i, z: S}]);
    gridLines.push([{x: -S, y: -S, z: i}, {x: -S, y: S, z: i}]);
    gridLines.push([{x: S, y: i, z: -S}, {x: S, y: i, z: S}]);
    gridLines.push([{x: S, y: -S, z: i}, {x: S, y: S, z: i}]);

    gridLines.push([{x: -S, y: i, z: -S}, {x: S, y: i, z: -S}]);
    gridLines.push([{x: i, y: -S, z: -S}, {x: i, y: S, z: -S}]);
    gridLines.push([{x: -S, y: i, z: S}, {x: S, y: i, z: S}]);
    gridLines.push([{x: i, y: -S, z: S}, {x: i, y: S, z: S}]);
}

const boxVs = [
    {x: -S, y: -S, z: -S}, {x: S, y: -S, z: -S}, {x: S, y: S, z: -S}, {x: -S, y: S, z: -S},
    {x: -S, y: -S, z: S},  {x: S, y: -S, z: S},  {x: S, y: S, z: S},  {x: -S, y: S, z: S}
];

const boxFs = [
    [0, 1, 2, 3], [4, 5, 6, 7], [0, 4], [1, 5], [2, 6], [3, 7]
];

let apple = {x: 0, y: 0, z: 0};

function spawnApple() {
    let valid = false;
    const maxBound = Math.floor(S); 

    while (!valid) {
        let rx = Math.floor(Math.random() * (2 * maxBound + 1)) - maxBound;
        let ry = Math.floor(Math.random() * (2 * maxBound + 1)) - maxBound;
        let rz = Math.floor(Math.random() * (2 * maxBound + 1)) - maxBound;
        
        apple = {x: rx, y: ry, z: rz};
        
        valid = true;
        for (let s of snake) {
            if (s.x === apple.x && s.y === apple.y && s.z === apple.z) {
                valid = false;
                break;
            }
        }
    }
}

function appleSegment({x, y, z}) {
    const s = 0.6;
    const boxVs = [
        {x: x - s / 2, y: y - s / 2, z: z - s / 2}, {x: x + s / 2, y: y - s / 2, z: z - s / 2}, {x: x + s / 2, y: y + s / 2, z: z - s / 2}, {x: x - s / 2, y: y + s / 2, z: z - s / 2},
        {x: x - s / 2, y: y - s / 2, z: z + s / 2}, {x: x + s / 2, y: y - s / 2, z: z + s / 2}, {x: x + s / 2, y: y + s / 2, z: z + s / 2}, {x: x - s / 2, y: y + s / 2, z: z + s / 2}
    ];
    const boxFs = [
        [0, 1, 2, 3], [4, 5, 6, 7], [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3; 

    for(let f of boxFs) {
        ctx.beginPath();
        for(let i = 0; i < f.length; i++){
            const a = boxVs[f[i]];
            const b = boxVs[f[(i+1)%f.length]];
            let projA = screen(project(transform(a)));
            let projB = screen(project(transform(b)));
            
            ctx.moveTo(projA.x, projA.y);
            ctx.lineTo(projB.x, projB.y);
        }
        ctx.stroke();
    }
}

window.addEventListener("keydown", (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) { e.preventDefault(); }

    if (!activeRot.axis) {
        if(e.key === "ArrowLeft")  activeRot = { axis: 'y', target:  Math.PI / 2, current: 0 };
        if(e.key === "ArrowRight") activeRot = { axis: 'y', target: -Math.PI / 2, current: 0 };
        if(e.key === "ArrowUp")    activeRot = { axis: 'x', target:  Math.PI / 2, current: 0 };
        if(e.key === "ArrowDown")  activeRot = { axis: 'x', target: -Math.PI / 2, current: 0 };
    }

    if(e.key === "z") { dz -= 1.0; if(dz < 6) dz = 6; }
    if(e.key === "x") { dz += 1.0; if(dz > 30) dz = 30; }

    let newDir = null;
    if(e.key === "w") newDir = {x: 0, y: 1, z: 0};  
    if(e.key === "s") newDir = {x: 0, y: -1, z: 0}; 
    if(e.key === "a") newDir = {x: -1, y: 0, z: 0}; 
    if(e.key === "d") newDir = {x: 1, y: 0, z: 0};  

    if(newDir) {
        if (inputQueue.length < 2) {
            let lastDir = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : snakeDir;

            if(newDir.x !== -lastDir.x || newDir.y !== -lastDir.y || newDir.z !== -lastDir.z) {
                inputQueue.push(newDir);
                
                if (snakeDir.x === 0 && snakeDir.y === 0 && snakeDir.z === 0) {
                    lastMoveTime = 0; 
                }
            }
        }
    }
});

spawnApple();

function frame(){
    clear();

    if (activeRot.axis) {
        const rotSpeed = 0.25;
        activeRot.current += Math.sign(activeRot.target) * rotSpeed;
        
        lastMoveTime += 1000/FPS; 

        if (Math.abs(activeRot.current) >= Math.abs(activeRot.target)) {
            applyPermanentRotation();
        }
    }

    const now = Date.now();
    if(now - lastMoveTime > MOVE_INTERVAL) {
        lastMoveTime = now;
        
        if (inputQueue.length > 0) {
            snakeDir = inputQueue.shift();
        }

        if(snakeDir.x !== 0 || snakeDir.y !== 0 || snakeDir.z !== 0) {
            let head = snake[0]; 
            
            let nextX = head.x + snakeDir.x;
            let nextY = head.y + snakeDir.y;
            let nextZ = head.z + snakeDir.z;

            let selfCollision = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === nextX && snake[i].y === nextY && snake[i].z === nextZ) {
                    selfCollision = true;
                    break;
                }
            }

            if (selfCollision) {
                console.log("Game Over! Score: " + (snake.length - 1));
                snake = [{x: 0, y: 0, z: 0}];
                snakeDir = {x: 0, y: 0, z: 0};
                inputQueue = [];
                spawnApple();
            } else {
                if (nextX >= -S && nextX <= S &&
                    nextY >= -S && nextY <= S &&
                    nextZ >= -S && nextZ <= S) {
                    
                    snake.unshift({x: nextX, y: nextY, z: nextZ});
                    
                    if (nextX === apple.x && nextY === apple.y && nextZ === apple.z) {
                        spawnApple();
                    } else {
                        snake.pop(); 
                    }
                    
                } else {
                    snakeDir = {x: 0, y: 0, z: 0}; 
                    inputQueue = [];
                }
            }
        }
    }

    for(let g of gridLines) {
        let projA = screen(project(transform(g[0])));
        let projB = screen(project(transform(g[1])));
        gridLine(projA, projB);
    }

    for(let f of boxFs) {
        for(let i = 0; i < f.length; i++){
            const a = boxVs[f[i]];
            const b = boxVs[f[(i+1)%f.length]];

            let projA = screen(project(transform(a)));
            let projB = screen(project(transform(b)));

            line(projA, projB);
        }
    }

    appleSegment(apple);

    for(let i = 0; i < snake.length; i++) {
        snakeSegment(snake[i], i === 0); 

        if (i > 0) {
            let projM1 = screen(project(transform(snake[i-1])));
            let projM2 = screen(project(transform(snake[i])));
            
            ctx.strokeStyle = FOREGROUND; 
            ctx.lineWidth = 2; 
            ctx.beginPath();
            ctx.moveTo(projM1.x, projM1.y);
            ctx.lineTo(projM2.x, projM2.y);
            ctx.stroke();
        }
    }

    ctx.fillStyle = FOREGROUND;
    ctx.font = "bold 24px monospace";
    ctx.fillText("SCORE: " + (snake.length - 1), 20, 40);

    setTimeout(frame, 1000/FPS);
}
setTimeout(frame, 1000/FPS);
