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
1.  Ensure you have the three files (`index.html`, `style.css`, `script.js`) in the same directory.
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