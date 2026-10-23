# Retro Neon Snake 🐍

A modern retro-arcade Snake game built from scratch with pure HTML5 Canvas, CSS3, and Vanilla JavaScript. Features glowing neon visuals, sound effects powered by the Web Audio API, speed progression, and local high score tracking.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

- **🎮 Smooth Grid Mechanics:** 20×20 grid rendered frame-by-frame on HTML5 Canvas.
- **🍎 Food & Golden Apples:** Normal apples (+10 pts) and rare Golden Apples (+30 pts).
- **🔊 Synthesized Sound Effects:** Built-in Web Audio API chimes for eating, crashing, and pausing (no external audio files required).
- **🏆 High Score Tracking:** Remembers your personal best score across sessions using browser `localStorage`.
- **⚡ Dynamic Speed Progression:** Increases game speed as your score climbs.
- **🕹️ Dual Controls:** Arrow keys / WASD for keyboard, plus on-screen D-pad for mouse and touchscreens.
- **⏸️ Pause & Difficulty Settings:** Easy, Normal, and Hard speed presets, plus instant pause (<kbd>Space</kbd> or <kbd>P</kbd>).

---

## 🕹️ Controls

| Action | Keyboard Key | On-Screen |
| :--- | :--- | :--- |
| **Move Up** | <kbd>↑</kbd> or <kbd>W</kbd> | ▲ Button |
| **Move Down** | <kbd>↓</kbd> or <kbd>S</kbd> | ▼ Button |
| **Move Left** | <kbd>←</kbd> or <kbd>A</kbd> | ◀ Button |
| **Move Right** | <kbd>→</kbd> or <kbd>D</kbd> | ▶ Button |
| **Pause / Resume** | <kbd>Space</kbd> or <kbd>P</kbd> | Pause Button |

---

## 🚀 How to Run Locally

### Option 1: Direct File
Double-click `index.html` to open in any browser.

### Option 2: Local HTTP Server (Python)
```bash
# Navigate to the folder
cd snake-game

# Start server
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## 🛠️ Project Structure

```
snake-game/
├── index.html     # Game screen, HUD, and canvas
├── style.css      # Retro neon arcade theme & layout
├── script.js      # Game loop, snake body queue, audio, and controls
├── .gitignore     # Files to ignore in Git
└── README.md      # Documentation
```

---

## 📄 License
MIT License. Free to use, modify, and learn from!
