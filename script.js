let scene, camera, renderer, controls;
let gridSlots = [];
let currentPlayer = 1; // 1 = Human (Red), 2 = Bot (Blue)
let gameOver = false;
let isBotThinking = false;
let boardState = new Array(27).fill(0);
let difficulty = 'hard'; // 'easy' | 'medium' | 'hard'

const P1_COLOR = 0xff3b30;
const P2_COLOR = 0x007aff;
const WIN_COLOR = 0xffd700;
const EMPTY_COLOR = 0xffffff;
const SPACING = 2.2;

const turnDisplay   = document.getElementById('turn-display');
const statusDisplay = document.getElementById('status-display');
const winningLines  = [];

// ─────────────────────────────────────────────
//  Difficulty settings
//  easy   → random moves
//  medium → minimax depth 2
//  hard   → minimax depth 4 + α/β pruning
// ─────────────────────────────────────────────
const DEPTH_MAP = { easy: 0, medium: 2, hard: 4 };

// ─────────────────────────────────────────────
//  Winning-line generator
// ─────────────────────────────────────────────
function generateWinningLines() {
    const idx = (x, y, z) => x * 9 + y * 3 + z;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            winningLines.push([idx(i, j, 0), idx(i, j, 1), idx(i, j, 2)]);
            winningLines.push([idx(i, 0, j), idx(i, 1, j), idx(i, 2, j)]);
            winningLines.push([idx(0, i, j), idx(1, i, j), idx(2, i, j)]);
        }
    }
    for (let i = 0; i < 3; i++) {
        winningLines.push([idx(0, 0, i), idx(1, 1, i), idx(2, 2, i)]);
        winningLines.push([idx(0, 2, i), idx(1, 1, i), idx(2, 0, i)]);
        winningLines.push([idx(0, i, 0), idx(1, i, 1), idx(2, i, 2)]);
        winningLines.push([idx(0, i, 2), idx(1, i, 1), idx(2, i, 0)]);
        winningLines.push([idx(i, 0, 0), idx(i, 1, 1), idx(i, 2, 2)]);
        winningLines.push([idx(i, 0, 2), idx(i, 1, 1), idx(i, 2, 0)]);
    }
    winningLines.push([idx(0,0,0), idx(1,1,1), idx(2,2,2)]);
    winningLines.push([idx(0,0,2), idx(1,1,1), idx(2,2,0)]);
    winningLines.push([idx(0,2,0), idx(1,1,1), idx(2,0,2)]);
    winningLines.push([idx(0,2,2), idx(1,1,1), idx(2,0,0)]);
}

// ─────────────────────────────────────────────
//  Three.js initialisation
// ─────────────────────────────────────────────
function init() {
    generateWinningLines();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 6, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const sphereGeom = new THREE.SphereGeometry(0.35, 32, 32);

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                const mat = new THREE.MeshPhongMaterial({
                    color: EMPTY_COLOR,
                    transparent: true,
                    opacity: 0.25,
                    shininess: 100
                });
                const mesh = new THREE.Mesh(sphereGeom, mat);
                mesh.position.set((x - 1) * SPACING, (y - 1) * SPACING, (z - 1) * SPACING);
                mesh.userData = { index: x * 9 + y * 3 + z };
                scene.add(mesh);
                gridSlots.push(mesh);
            }
        }
    }

    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    window.addEventListener('pointerdown', (e) => {
        if (gameOver || currentPlayer === 2 || isBotThinking) return;
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;

        mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(gridSlots);

        if (hits.length > 0) {
            const idx = hits[0].object.userData.index;
            if (boardState[idx] === 0) makeMove(idx);
        }
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

// ─────────────────────────────────────────────
//  Game logic
// ─────────────────────────────────────────────
function makeMove(index) {
    boardState[index] = currentPlayer;
    const mesh = gridSlots[index];
    mesh.material.opacity = 1.0;
    mesh.material.color.setHex(currentPlayer === 1 ? P1_COLOR : P2_COLOR);
    mesh.scale.set(1.4, 1.4, 1.4);

    const winLine = getWinningLine(boardState, currentPlayer);
    if (winLine) {
        gameOver = true;
        highlightWinningLine(winLine);
        if (currentPlayer === 1) {
            turnDisplay.innerText  = '🎉 You Win!';
            turnDisplay.style.color = '#ff3b30';
        } else {
            turnDisplay.innerText  = '🤖 Bot Wins!';
            turnDisplay.style.color = '#007aff';
        }
        statusDisplay.innerText = 'Click Reset Game to play again.';
        return;
    }

    if (!boardState.includes(0)) {
        gameOver = true;
        turnDisplay.innerText  = "It's a Draw! 🤝";
        turnDisplay.style.color = 'white';
        statusDisplay.innerText = 'Click Reset Game to play again.';
        return;
    }

    if (currentPlayer === 1) {
        currentPlayer = 2;
        const label = difficulty === 'easy'   ? 'Easy'
                    : difficulty === 'medium' ? 'Medium'
                    : 'Hard';
        turnDisplay.innerText  = `🤖 Bot thinking… [${label}]`;
        turnDisplay.style.color = '#007aff';
        isBotThinking = true;
        setTimeout(botTurn, 400);
    } else {
        currentPlayer = 1;
        turnDisplay.innerText  = 'Your Turn (Red)';
        turnDisplay.style.color = 'white';
    }
}

// ─────────────────────────────────────────────
//  Highlight winning spheres
// ─────────────────────────────────────────────
function highlightWinningLine(line) {
    line.forEach(i => {
        gridSlots[i].material.color.setHex(WIN_COLOR);
        gridSlots[i].material.emissive = new THREE.Color(0xffd700);
        gridSlots[i].material.emissiveIntensity = 0.5;
        gridSlots[i].scale.set(1.6, 1.6, 1.6);
    });
}

// ─────────────────────────────────────────────
//  Bot dispatcher
// ─────────────────────────────────────────────
function botTurn() {
    if (gameOver) return;
    isBotThinking = false;

    let targetIndex = -1;

    if (difficulty === 'easy') {
        // Pure random
        const avail = emptyIndices(boardState);
        if (avail.length) targetIndex = avail[Math.floor(Math.random() * avail.length)];
    } else {
        const depth = DEPTH_MAP[difficulty];
        targetIndex = minimaxRoot(boardState, depth);
    }

    if (targetIndex !== -1) makeMove(targetIndex);
}

// ─────────────────────────────────────────────
//  Minimax with Alpha-Beta Pruning
// ─────────────────────────────────────────────

/**
 * Returns the best move index for the Bot (player 2).
 */
function minimaxRoot(state, maxDepth) {
    // Always handle instant-win / instant-block at the root (speed + correctness)
    const winNow   = findInstantMove(state, 2);
    if (winNow   !== -1) return winNow;
    const blockNow = findInstantMove(state, 1);
    if (blockNow !== -1) return blockNow;

    // Center heuristic on first move
    if (state[13] === 0 && emptyIndices(state).length === 27) return 13;

    let bestScore = -Infinity;
    let bestMove  = -1;

    const moves = orderedMoves(state);

    for (const idx of moves) {
        state[idx] = 2;
        const score = minimax(state, maxDepth - 1, -Infinity, Infinity, false);
        state[idx] = 0;
        if (score > bestScore) {
            bestScore = score;
            bestMove  = idx;
        }
    }
    return bestMove !== -1 ? bestMove : (emptyIndices(state)[0] ?? -1);
}

/**
 * Recursive minimax with α/β pruning.
 * Maximising player = Bot (2), minimising player = Human (1).
 */
function minimax(state, depth, alpha, beta, isMaximising) {
    // Terminal checks
    if (checkWin(state, 2)) return  1000 + depth;   // Bot wins – faster wins score higher
    if (checkWin(state, 1)) return -1000 - depth;   // Human wins – faster losses score lower
    const empty = emptyIndices(state);
    if (empty.length === 0 || depth === 0) return evaluate(state);

    if (isMaximising) {
        let best = -Infinity;
        for (const idx of orderedMoves(state)) {
            state[idx] = 2;
            best = Math.max(best, minimax(state, depth - 1, alpha, beta, false));
            state[idx] = 0;
            alpha = Math.max(alpha, best);
            if (beta <= alpha) break; // β cut-off
        }
        return best;
    } else {
        let best = Infinity;
        for (const idx of orderedMoves(state)) {
            state[idx] = 1;
            best = Math.min(best, minimax(state, depth - 1, alpha, beta, true));
            state[idx] = 0;
            beta = Math.min(beta, best);
            if (beta <= alpha) break; // α cut-off
        }
        return best;
    }
}

/**
 * Heuristic evaluation for non-terminal states.
 * Counts lines with only-Bot cells vs only-Human cells.
 */
function evaluate(state) {
    let score = 0;
    for (const line of winningLines) {
        const vals = line.map(i => state[i]);
        const botCount   = vals.filter(v => v === 2).length;
        const humanCount = vals.filter(v => v === 1).length;

        if (botCount > 0 && humanCount === 0) {
            score += botCount === 2 ? 10 : 1;
        } else if (humanCount > 0 && botCount === 0) {
            score -= humanCount === 2 ? 10 : 1;
        }
    }
    // Center bonus
    if (state[13] === 2) score += 5;
    if (state[13] === 1) score -= 5;
    return score;
}

/**
 * Move ordering: prefer moves that complete/block a line, then center, then edges.
 */
function orderedMoves(state) {
    const empty = emptyIndices(state);

    // Score each candidate move for ordering
    return empty.slice().sort((a, b) => movePriority(state, b) - movePriority(state, a));
}

function movePriority(state, idx) {
    let p = 0;
    if (idx === 13) p += 8; // center

    for (const line of winningLines) {
        if (!line.includes(idx)) continue;
        const vals = line.map(i => state[i]);
        const botCount   = vals.filter(v => v === 2).length;
        const humanCount = vals.filter(v => v === 1).length;
        const empty      = vals.filter(v => v === 0).length;

        if (empty >= 1) {
            if (botCount === 2) p += 20; // can win
            if (humanCount === 2) p += 18; // must block
            if (botCount === 1) p += 2;
            if (humanCount === 1) p += 1;
        }
    }
    return p;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function emptyIndices(state) {
    return state.reduce((acc, v, i) => { if (v === 0) acc.push(i); return acc; }, []);
}

function findInstantMove(state, player) {
    for (let i = 0; i < state.length; i++) {
        if (state[i] !== 0) continue;
        state[i] = player;
        const wins = checkWin(state, player);
        state[i] = 0;
        if (wins) return i;
    }
    return -1;
}

function checkWin(state, player) {
    return winningLines.some(line =>
        state[line[0]] === player &&
        state[line[1]] === player &&
        state[line[2]] === player
    );
}

function getWinningLine(state, player) {
    return winningLines.find(line =>
        state[line[0]] === player &&
        state[line[1]] === player &&
        state[line[2]] === player
    ) || null;
}

// ─────────────────────────────────────────────
//  Difficulty selector (called from HTML)
// ─────────────────────────────────────────────
function setDifficulty(val) {
    difficulty = val;
    resetGame();
}

// ─────────────────────────────────────────────
//  Reset / resize / animation loop
// ─────────────────────────────────────────────
function resetGame() {
    boardState.fill(0);
    gameOver      = false;
    isBotThinking = false;
    currentPlayer = 1;

    turnDisplay.innerText   = 'Your Turn (Red)';
    turnDisplay.style.color = 'white';
    statusDisplay.innerText = 'Click a sphere. Drag to rotate grid.';

    gridSlots.forEach(mesh => {
        mesh.material.color.setHex(EMPTY_COLOR);
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
        mesh.material.opacity = 0.25;
        mesh.scale.set(1, 1, 1);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    gridSlots.forEach(mesh => {
        if (mesh.scale.x > 1.05) {
            mesh.scale.x = Math.max(1, mesh.scale.x - 0.025);
            mesh.scale.y = mesh.scale.x;
            mesh.scale.z = mesh.scale.x;
        }
    });

    renderer.render(scene, camera);
}

init();