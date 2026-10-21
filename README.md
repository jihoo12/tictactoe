# 🌐 3D Tic-Tac-Toe vs AI Bot

A technically robust implementation of the classic game Tic-Tac-Toe expanded into a three-dimensional grid (a $3 \times 3 \times 3$ cube). This project utilizes WebGL via Three.js to render the game environment, providing an immersive, interactive experience against a customizable Artificial Intelligence opponent.

## ✨ Features

*   **Three-Dimensional Gameplay:** Play on a fully navigable $3 \times 3 \times 3$ cubic grid rendered using Three.js.
*   **Interactive Controls:** Supports standard orbiting controls (drag to rotate) and direct sphere clicking for moves.
*   **Advanced AI Opponent:** Features an intelligent opponent powered by the **Minimax algorithm**.
*   **Scalable Difficulty Settings:** Choose from three levels of difficulty, dynamically adjusting the AI's search depth:
    *   🟢 **Easy:** Random moves (Minimal intelligence).
    *   🟡 **Medium:** Minimax Depth 2.
    *   🔴 **Hard:** Minimax Depth 4+ with Alpha-Beta Pruning (Near optimal play).
*   **Clean UI/UX:** Separate, overlaid status and control panels manage game flow regardless of camera angle.

## 🏗️ Architecture & Technology Stack

The application is structured using a Model-View-Controller pattern approach:

| Component | Technology / Algorithm | Description |
| :--- | :--- | :--- |
| **View** | Three.js, WebGL | Handles all rendering of the $3 \times 3 \times 3$ grid and spheres. Provides camera controls (`OrbitControls`). |
| **Model** | JavaScript Array (27 slots) | Maintains the canonical game state (`boardState`) independent of the visual representation. |
| **Controller / Logic** | Minimax Algorithm, Alpha-Beta Pruning | Determines legal moves and calculates optimal future states based on the selected difficulty depth. |
| **Interface** | HTML5, CSS3 (Styled) | Manages UI elements: turn display, status messages, and difficulty selection dropdown. |

### 🧠 AI Logic Deep Dive

The `script.js` file implements sophisticated decision-making:

*   **Evaluation Function:** Scores board positions based on immediate wins or forcing moves for the current player.
*   **Minimax Search:** Recursively explores the game tree to find the move that maximizes the outcome against an opponent trying to minimize it.
*   **Pruning:** For the 'Hard' difficulty, **Alpha-Beta Pruning** is employed to drastically reduce the search space without sacrificing accuracy, allowing deep searches within acceptable computational limits.

## ⚙️ Prerequisites & Setup

This project is designed as a single, self-contained HTML file leveraging external CDN libraries for simplicity.

### Requirements:
*   A modern web browser (Chrome, Firefox, etc.).
*   Basic understanding of JavaScript and DOM manipulation.

### How to Run Locally:
1.  Ensure you have all five files (`index.html`, `style.css`, `script.js`, `rift.js`, `four-d.js`) in the same directory. `rift.js` is required for Nightmare mode.
2.  Open `index.html` directly in your web browser.

*(Note: Since external dependencies (Three.js) are included via CDNs, no local package installation or build steps are necessary.)*

## 🕹️ Usage Instructions

### Playing the Game

1.  **Start:** The game initializes automatically. You will always start as the Red player (`Human`).
2.  **Controls:**
    *   **Clicking:** Click on any empty sphere in the grid to place your mark (X or O).
    *   **Rotating View:** Drag your mouse across the screen to rotate and inspect the 3D board from any angle.
3.  **AI Turn:** After you make a move, the AI opponent will analyze the board state according to the selected difficulty level and execute its optimal move automatically.

### Adjusting Difficulty

Use the **Difficulty Select** dropdown panel:
*   Selecting **Easy** drastically reduces AI thinking time but makes the game trivial.
*   Selecting **Medium** provides a balanced challenge utilizing limited lookahead depth.
*   Selecting **Hard** challenges your skills with deep, strategic analysis (Note: Increased difficulty may cause brief processing pauses while the AI calculates its optimal move).

### Resetting the Game

Click the **Reset Game** button to clear the board and restart from the initial state.

## 📐 Board Layout & Gameplay Guide

The game utilizes a standard $3 \times 3$ grid in three dimensions ($Z=0, Z=1, Z=2$), resulting in 27 playable positions. Winning requires connecting three markers (a line).

### Coordinate System Mapping
The coordinates $(x, y, z)$ map to specific indices used internally by the game logic:

*   **X:** Left/Right Axis (index 0 to 2)
*   **Y:** Up/Down Axis (index 0 to 2)
*   **Z:** Front/Back Axis (index 0 to 2)

### Winning Lines
A victory is achieved by aligning three spheres along any of the following axes or diagonals:

1.  **Axes (Parallel):** Straight lines parallel to X, Y, or Z axes (9 planes $\times$ 3 directions = 27 potential line segments).
2.  **Space Diagonals:** Lines connecting corners across the volume of the cube (e.g., top-front-left corner to bottom-back-right corner).

***Good luck! Try to achieve a victory against the 'Hard' AI opponent.***
## 🌀 DIMENSION RIFT — Nightmare Mode

Select **🌀 DIMENSION RIFT · Nightmare** from the difficulty menu for a new spatial-strategy challenge.

- **Rotating layers:** After each pair of turns (human, then AI), one 3×3 slice of the cube rotates 90° and carries its occupied cells along with it.
- **Predictable sequence:** The purple HUD forecasts the next axis and slice. The rotation sequence repeats every six shifts, allowing deliberate planning rather than relying on luck.
- **New win opportunities:** A rotation may complete a previously broken line, or disrupt what looked like a safe defense. The game checks wins after both placements and shifts.
- **Rotation-aware AI:** The bot uses tactical threat detection, rotation-aware move ordering, and a bounded alpha-beta search that simulates upcoming shifts. This is a challenging heuristic opponent, not a claim of perfect play.
- **Separate mode:** Easy, Medium, and Hard retain their original rules.

**Rules:** You move first (red). The AI places blue, then the announced slice rotates. Three in a straight 3D line wins immediately after any placement or rotation. If both sides acquire winning lines in the same rotation, the result is a draw. A full board without a winner also draws.

**Implementation:** `rift.js` extends the existing game without modifying its classic AI. No build tools are required. Launch `index.html` with an internet connection to load Three.js from the existing CDNs.


## 💠 HYPERCUBE — True 4D mode

Choose **HYPERCUBE · 4D (81 cells)** from the mode selector.

- **Real four-dimensional coordinates:** Every cell has an `(x,y,z,w)` coordinate in `{0,1,2}^4` — **81 playable cells**.
- **Three 3D slices:** The three separated cubes represent `w=0`, `w=1`, and `w=2`. Within each cube, positions encode X, Y, and Z.
- **True 4D wins:** All straight 3-cell lines in 4D count, including diagonals that vary on the W axis alongside other dimensions. Generated algorithmically by primitive direction vectors with components -1, 0, or +1.
- **4D opponent:** The computer looks for immediate wins and blocks, scores multi-line forks, and estimates strong human replies. It is a heuristic AI and does not guarantee unbeatable play.
- **How to play:** Rotate your camera by dragging and click an unoccupied sphere. The red player goes first. Win by placing three along any valid 4D line.

The 4D view and game state are isolated from the original 3D and Rift modes. The page requires `four-d.js` alongside the other source files.

