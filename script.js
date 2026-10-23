/**
 * Neon Arcade Snake Engine
 * 1. 20x20 Grid Engine with HTML5 Canvas
 * 2. Food & Golden Apple Spawning
 * 3. Collision Detection (Walls & Self)
 * 4. LocalStorage High Score Persistence
 * 5. Web Audio API Sound Generator
 */

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 20; // 20x20 grid
const TILE_SIZE = canvas.width / GRID_SIZE; // 20px per tile

// ==========================================
// 2. GAME STATE
// ==========================================
let snake = [];
let food = { x: 5, y: 5, isGolden: false };
let velocity = { x: 1, y: 0 };
let nextVelocity = { x: 1, y: 0 };

let score = 0;
let highScore = parseInt(localStorage.getItem("snake_high_score") || "0");
let gameInterval = null;
let currentSpeed = 90; // Tick interval in milliseconds
let isRunning = false;
let isPaused = false;
let soundEnabled = true;

// DOM Elements
const scoreVal = document.getElementById("score-val");
const highScoreVal = document.getElementById("high-score-val");
const speedVal = document.getElementById("speed-val");
const overlayScreen = document.getElementById("overlay-screen");
const overlayTitle = document.getElementById("overlay-title");
const overlaySubtitle = document.getElementById("overlay-subtitle");
const btnStart = document.getElementById("btn-start");
const btnPause = document.getElementById("btn-pause");
const btnSound = document.getElementById("btn-sound");
const diffButtons = document.querySelectorAll(".diff-btn");

// Init High Score UI
highScoreVal.textContent = highScore;

// ==========================================
// 3. SYNTHESIZED SOUND EFFECTS
// ==========================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playSound(freq, duration = 0.08, type = "sine") {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function soundEat(isGolden) {
  if (isGolden) {
    playSound(600, 0.08, "triangle");
    setTimeout(() => playSound(800, 0.12, "triangle"), 80);
  } else {
    playSound(440, 0.06, "sine");
  }
}

function soundDie() {
  playSound(180, 0.3, "sawtooth");
}

// ==========================================
// 4. CORE GAME MECHANICS
// ==========================================
function resetGame() {
  // Center snake with 3 body segments
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  velocity = { x: 1, y: 0 };
  nextVelocity = { x: 1, y: 0 };
  score = 0;
  scoreVal.textContent = score;
  spawnFood();
}

function spawnFood() {
  let validPosition = false;
  while (!validPosition) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);

    // Make sure food does not spawn inside the snake body
    const onSnake = snake.some((segment) => segment.x === x && segment.y === y);
    if (!onSnake) {
      // 15% chance to spawn a bonus Golden Apple
      const isGolden = Math.random() < 0.15;
      food = { x, y, isGolden };
      validPosition = true;
    }
  }
}

function update() {
  if (!isRunning || isPaused) return;

  // Apply queued velocity (prevents fast double-click suicide)
  velocity = { ...nextVelocity };

  // Calculate new head position
  const head = {
    x: snake[0].x + velocity.x,
    y: snake[0].y + velocity.y,
  };

  // 1. Collision with Walls
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    handleGameOver();
    return;
  }

  // 2. Collision with Self
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      handleGameOver();
      return;
    }
  }

  // Add new head to front
  snake.unshift(head);

  // 3. Eating Food
  if (head.x === food.x && head.y === food.y) {
    const points = food.isGolden ? 30 : 10;
    score += points;
    scoreVal.textContent = score;

    soundEat(food.isGolden);

    // Check & save High Score
    if (score > highScore) {
      highScore = score;
      highScoreVal.textContent = highScore;
      localStorage.setItem("snake_high_score", highScore);
    }

    // Dynamic speed progression: slight speedup every 50 points
    updateSpeedMultiplier();
    spawnFood();
  } else {
    // Remove tail segment if food was not eaten
    snake.pop();
  }

  draw();
}

function updateSpeedMultiplier() {
  const level = Math.floor(score / 50) + 1;
  speedVal.textContent = `${level}x`;
}

// ==========================================
// 5. RENDERING / DRAWING
// ==========================================
function draw() {
  // Clear canvas
  ctx.fillStyle = "#030712";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw subtle grid lines
  ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < canvas.width; i += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Draw Food
  if (food.isGolden) {
    ctx.fillStyle = "#fbbf24"; // Golden amber
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 15;
  } else {
    ctx.fillStyle = "#f43f5e"; // Rose apple
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 10;
  }
  ctx.beginPath();
  ctx.arc(
    food.x * TILE_SIZE + TILE_SIZE / 2,
    food.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw Snake
  snake.forEach((segment, index) => {
    const isHead = index === 0;

    if (isHead) {
      ctx.fillStyle = "#10b981"; // Bright emerald
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 12;
    } else {
      // Body gradient fade towards tail
      const shade = Math.max(80, 160 - index * 3);
      ctx.fillStyle = `rgb(16, ${shade}, 129)`;
      ctx.shadowBlur = 0;
    }

    // Rounded rectangle for segment
    roundRect(
      ctx,
      segment.x * TILE_SIZE + 1,
      segment.y * TILE_SIZE + 1,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      isHead ? 6 : 4
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw eyes on snake head
    if (isHead) {
      ctx.fillStyle = "#030712";
      const eyeOffset = 5;
      const eyeSize = 2.5;

      let eye1 = { x: segment.x * TILE_SIZE + eyeOffset, y: segment.y * TILE_SIZE + eyeOffset };
      let eye2 = { x: segment.x * TILE_SIZE + TILE_SIZE - eyeOffset, y: segment.y * TILE_SIZE + eyeOffset };

      if (velocity.y !== 0) {
        eye1 = { x: segment.x * TILE_SIZE + eyeOffset, y: segment.y * TILE_SIZE + (velocity.y > 0 ? TILE_SIZE - eyeOffset : eyeOffset) };
        eye2 = { x: segment.x * TILE_SIZE + TILE_SIZE - eyeOffset, y: segment.y * TILE_SIZE + (velocity.y > 0 ? TILE_SIZE - eyeOffset : eyeOffset) };
      }

      ctx.beginPath();
      ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
      ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ==========================================
// 6. GAME CONTROL FLOW
// ==========================================
function startGame() {
  resetGame();
  isRunning = true;
  isPaused = false;
  overlayScreen.classList.add("hidden");
  btnPause.textContent = "PAUSE (SPACE)";

  clearInterval(gameInterval);
  gameInterval = setInterval(update, currentSpeed);
  draw();
}

function handleGameOver() {
  isRunning = false;
  clearInterval(gameInterval);
  soundDie();

  overlayTitle.textContent = "GAME OVER";
  overlaySubtitle.textContent = `You scored ${score} points!`;
  btnStart.textContent = "PLAY AGAIN";
  overlayScreen.classList.remove("hidden");
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;

  if (isPaused) {
    btnPause.textContent = "RESUME (SPACE)";
    overlayTitle.textContent = "PAUSED";
    overlaySubtitle.textContent = "Press Space or click Resume to continue";
    btnStart.textContent = "RESUME";
    overlayScreen.classList.remove("hidden");
  } else {
    btnPause.textContent = "PAUSE (SPACE)";
    overlayScreen.classList.add("hidden");
  }
}

// ==========================================
// 7. INPUT LISTENERS (KEYBOARD & D-PAD)
// ==========================================
function handleDirectionChange(newVx, newVy) {
  // Prevent 180-degree instant reversal (cannot go directly opposite)
  if (velocity.x !== 0 && newVx === -velocity.x) return;
  if (velocity.y !== 0 && newVy === -velocity.y) return;

  nextVelocity = { x: newVx, y: newVy };
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      e.preventDefault();
      handleDirectionChange(0, -1);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      e.preventDefault();
      handleDirectionChange(0, 1);
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      e.preventDefault();
      handleDirectionChange(-1, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      e.preventDefault();
      handleDirectionChange(1, 0);
      break;
    case " ":
    case "p":
    case "P":
      e.preventDefault();
      togglePause();
      break;
  }
});

// D-Pad Click Listeners
document.getElementById("d-up").addEventListener("click", () => handleDirectionChange(0, -1));
document.getElementById("d-down").addEventListener("click", () => handleDirectionChange(0, 1));
document.getElementById("d-left").addEventListener("click", () => handleDirectionChange(-1, 0));
document.getElementById("d-right").addEventListener("click", () => handleDirectionChange(1, 0));

// Control Buttons
btnStart.addEventListener("click", () => {
  if (isPaused) togglePause();
  else startGame();
});

btnPause.addEventListener("click", togglePause);

btnSound.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  btnSound.textContent = soundEnabled ? "🔊" : "🔇";
});

// Difficulty Buttons
diffButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    diffButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentSpeed = parseInt(btn.getAttribute("data-speed"));

    if (isRunning && !isPaused) {
      clearInterval(gameInterval);
      gameInterval = setInterval(update, currentSpeed);
    }
  });
});

// Initial draw of empty board
resetGame();
draw();
