let scene, camera, renderer, controls;
let gridSlots = [];
let currentPlayer = 1; // 1 = Human (Red), 2 = Bot (Blue)
let gameOver = false;
let isBotThinking = false;
let boardState = new Array(27).fill(0);

const P1_COLOR = 0xff3b30;
const P2_COLOR = 0x007aff;
const EMPTY_COLOR = 0xffffff;
const SPACING = 2.2;

const turnDisplay = document.getElementById('turn-display');
const statusDisplay = document.getElementById('status-display');
const winningLines = [];

// ─────────────────────────────────────────────
//  Winning-line generator
// ─────────────────────────────────────────────
function generateWinningLines() {
    const getIndex = (x, y, z) => x * 9 + y * 3 + z;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // Rows along each axis
            winningLines.push([getIndex(i, j, 0), getIndex(i, j, 1), getIndex(i, j, 2)]);
            winningLines.push([getIndex(i, 0, j), getIndex(i, 1, j), getIndex(i, 2, j)]);
            winningLines.push([getIndex(0, i, j), getIndex(1, i, j), getIndex(2, i, j)]);
        }
    }

    for (let i = 0; i < 3; i++) {
        // Face diagonals
        winningLines.push([getIndex(0, 0, i), getIndex(1, 1, i), getIndex(2, 2, i)]);
        winningLines.push([getIndex(0, 2, i), getIndex(1, 1, i), getIndex(2, 0, i)]);
        winningLines.push([getIndex(0, i, 0), getIndex(1, i, 1), getIndex(2, i, 2)]);
        winningLines.push([getIndex(0, i, 2), getIndex(1, i, 1), getIndex(2, i, 0)]);
        winningLines.push([getIndex(i, 0, 0), getIndex(i, 1, 1), getIndex(i, 2, 2)]);
        winningLines.push([getIndex(i, 0, 2), getIndex(i, 1, 1), getIndex(i, 2, 0)]);
    }

    // Space diagonals
    winningLines.push([getIndex(0, 0, 0), getIndex(1, 1, 1), getIndex(2, 2, 2)]);
    winningLines.push([getIndex(0, 0, 2), getIndex(1, 1, 1), getIndex(2, 2, 0)]);
    winningLines.push([getIndex(0, 2, 0), getIndex(1, 1, 1), getIndex(2, 0, 2)]);
    winningLines.push([getIndex(0, 2, 2), getIndex(1, 1, 1), getIndex(2, 0, 0)]);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

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

                const flatIndex = x * 9 + y * 3 + z;
                mesh.userData = { index: flatIndex };

                scene.add(mesh);
                gridSlots.push(mesh);
            }
        }
    }

    // Pointer / click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('pointerdown', (e) => {
        if (gameOver || currentPlayer === 2 || isBotThinking) return;
        if (e.target.tagName === 'BUTTON') return;

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(gridSlots);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const idx = hitMesh.userData.index;
            if (boardState[idx] === 0) {
                makeMove(idx);
            }
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

    if (checkWin(boardState, currentPlayer)) {
        gameOver = true;
        if (currentPlayer === 1) {
            turnDisplay.innerText = "You Win! 🎉";
            turnDisplay.style.color = '#ff3b30';
        } else {
            turnDisplay.innerText = "Bot Wins! 🤖";
            turnDisplay.style.color = '#007aff';
        }
        statusDisplay.innerText = "Click Reset Game to play again.";
        return;
    }

    if (!boardState.includes(0)) {
        gameOver = true;
        turnDisplay.innerText = "It's a Draw! 🤝";
        statusDisplay.innerText = "Click Reset Game to play again.";
        return;
    }

    // Switch turns
    if (currentPlayer === 1) {
        currentPlayer = 2;
        turnDisplay.innerText = "Bot is thinking... 🤖";
        turnDisplay.style.color = '#007aff';
        isBotThinking = true;
        setTimeout(botTurn, 600);
    } else {
        currentPlayer = 1;
        turnDisplay.innerText = "Your Turn (Red)";
        turnDisplay.style.color = 'white';
    }
}

// ─────────────────────────────────────────────
//  AI Bot
// ─────────────────────────────────────────────
function botTurn() {
    if (gameOver) return;
    isBotThinking = false;

    let targetIndex = -1;

    // 1. Win immediately
    targetIndex = findWinningMove(2);

    // 2. Block human win
    if (targetIndex === -1) targetIndex = findWinningMove(1);

    // 3. Take center
    if (targetIndex === -1 && boardState[13] === 0) targetIndex = 13;

    // 4. Random fallback
    if (targetIndex === -1) {
        const available = boardState.reduce((acc, val, idx) => {
            if (val === 0) acc.push(idx);
            return acc;
        }, []);
        if (available.length > 0) {
            targetIndex = available[Math.floor(Math.random() * available.length)];
        }
    }

    if (targetIndex !== -1) makeMove(targetIndex);
}

function findWinningMove(player) {
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === 0) {
            boardState[i] = player;
            const isWin = checkWin(boardState, player);
            boardState[i] = 0;
            if (isWin) return i;
        }
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

// ─────────────────────────────────────────────
//  Reset / resize / animation loop
// ─────────────────────────────────────────────
function resetGame() {
    boardState.fill(0);
    gameOver = false;
    isBotThinking = false;
    currentPlayer = 1;

    turnDisplay.innerText = "Your Turn (Red)";
    turnDisplay.style.color = "white";
    statusDisplay.innerText = "Click a sphere. Drag to rotate grid.";

    gridSlots.forEach(mesh => {
        mesh.material.color.setHex(EMPTY_COLOR);
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
        if (mesh.scale.x > 1) {
            mesh.scale.x -= 0.02;
            mesh.scale.y -= 0.02;
            mesh.scale.z -= 0.02;
        }
    });

    renderer.render(scene, camera);
}

init();