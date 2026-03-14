# 3D Wireframe Snake 🐍🕹️

A classic Snake game reimagined in a fully playable 3D wireframe environment. Built entirely from scratch using **Vanilla JavaScript** and **HTML5 Canvas**—no external 3D libraries or game engines were used.

## 🌟 Features

* **Custom 3D Engine:** Implements custom 3D-to-2D projection, translation, and rotation matrices purely through JavaScript and Canvas 2D API.
* **Gimbal Lock Solution:** Solves the classic 3D rotation gimbal lock problem by applying permanent world-state rotations rather than relying on relative camera angles.
* **Input Queuing:** Features an input buffer system for smooth, zero-latency snake controls, allowing for rapid successive turns without losing keystrokes.
* **Dynamic Spatial Awareness:** The player controls the snake relative to the screen (W is always UP), while manipulating the entire 3D space around the snake to navigate.
* **Retro Cyberpunk Aesthetics:** Nostalgic glowing neon green and gold wireframe visuals on a deep black canvas.

## 🎮 Controls

The game requires simultaneous control of the snake and the 3D world:

* **`W` `A` `S` `D`** : Move the snake (Up, Left, Down, Right relative to your screen).
* **`Arrow Keys`** : Rotate the 3D world (Cube) to change your perspective.
* **`Z` / `X`** : Zoom In / Zoom Out.

## 🚀 How to Run

Since the game is built with vanilla web technologies, there are no dependencies to install or servers to configure.
