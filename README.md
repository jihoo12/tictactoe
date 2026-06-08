# 🏆 Quantum Tic-Tac-Toe: A Three-Dimensional Strategy Game

This repository contains the client-side JavaScript logic for a sophisticated implementation of 3D Tic-Tac-Toe (also known as Connect Four in a cube format). The game features dynamic difficulty settings powered by Minimax AI, allowing players to test their skills against escalating levels of artificial intelligence.

## ✨ Features

*   **Three-Dimensional Grid:** Plays on a $3 \times 3 \times 3$ board structure.
*   **Advanced AI Engine:** Implements the Minimax algorithm with configurable depth:
    *   **Easy:** Random moves (Depth 0).
    *   **Medium:** Depth 2 search (Basic predictive opponent).
    *   **Hard:** Depth 4 search utilizing Alpha-Beta Pruning for optimal play.
*   **Turn Management:** Clear visualization of current player turn and game status.
*   **Modular Design:** Separates core game logic, AI calculation, and rendering instructions into a single, maintainable JavaScript module (`script.js`).

## 🏗️ Architecture Overview

The application utilizes a standard client-side architecture common in interactive web games:

1.  **Game State Management (JS Core):** The `boardState` array tracks the status of all 27 grid slots. Constants define player colors and winning lines, ensuring robust game logic checks.
2.  **Visual Engine Integration:** (Assumed Three.js/WebGL Context) Variables like `scene`, `camera`, and `renderer` indicate that this script is designed to manipulate a 3D rendering environment, visualizing the board and placements.
3.  **AI Logic (Minimax):** The core intelligence resides in functions that recursively explore game states based on the selected `difficulty`. Alpha-Beta pruning significantly optimizes performance for deeper search trees.
4.  **User Interface Interaction:** Selectors targeting elements like `#turn-display` and `#status-display` ensure dynamic feedback to the human player about whose turn it is and the game outcome.

## ⚙️ Prerequisites

To run this project, you need a basic web development environment capable of running modern JavaScript (ES6+).

### Dependencies:
*   **HTML:** Must contain the required DOM elements (`turn-display`, `status-display`).
*   **JavaScript Runtime:** A browser environment (recommended Chrome/Firefox) to execute the logic.
*   **3D Library:** The use of variables like `scene`, `camera`, and `renderer` strongly suggests that this script must be paired with a 3D rendering library, such as **Three.js**.

### Setup Instructions:

1.  Save the provided code block as `script.js`.
2.  Ensure your main HTML file correctly links the necessary libraries (e.g., Three.js) and includes the `script.js` file at the end of the `<body>`.

## 🚀 Usage Guide

### Running the Game

Simply load your HTML page containing the linked script. The game initializes by checking the current difficulty setting and displaying the initial board state and player turn.

### Controlling Difficulty

The AI difficulty can be dynamically changed by modifying the global `difficulty` constant in `script.js`:

```javascript
// Global variable declaration:
let difficulty = 'hard'; // Options: 'easy', 'medium', or 'hard'
```

| Setting | Depth (Minimax) | Behavior | Best For |
| :--- | :--- | :--- | :--- |
| `easy` | 0 | Makes random, non-strategic moves. | Beginners/Casual Play |
| `medium` | 2 | Predicts the immediate next move of the opponent (depth 2). | Intermediate Players |
| `hard` | 4+ | Optimized play using Alpha-Beta pruning; approaches perfect play. | Advanced Users/Challenge Mode |

### Technical API Reference

#### Constants & Variables

| Variable | Type | Description |
| :--- | :--- | :--- |
| `P1_COLOR`, `P2_COLOR` | Number (Hex) | Hex color values for Player 1 (Red) and Player 2 (Blue). |
| `boardState` | Array<number> | Represents the current state of all 27 slots (0 = empty, 1 = P1, 2 = P2). |
| `winningLines` | Array<Array<number>> | List of 48 possible coordinate indices that constitute a winning combination. |
| `DEPTH_MAP` | Object | Maps difficulty strings ('easy', 'medium', 'hard') to corresponding Minimax search depths (0, 2, 4). |

#### Key Functions & Methods

*   **`generateWinningLines()`:** Initializes the static list of all possible winning triplets by iterating through all axis planes and diagonals.
*   **`calculateWinner(board)`:** Iterates through `winningLines` to check if any given player (1 or 2) has three marks aligned on the current board state.
*   **AI Logic Integration:** The Minimax algorithm manages decision-making, using the stored depth from `DEPTH_MAP` to determine computational complexity and opponent predictability.

---
***Disclaimer: This README assumes the necessary HTML structure and external library dependencies (like Three.js) are available for the provided JavaScript logic (`script.js`) to execute correctly.***