const gameArea = document.getElementById("gameArea");
const bb8 = document.getElementById("bb8");
const light = document.getElementById("light");
const scoreEl = document.getElementById("score");
const lastTimeEl = document.getElementById("lastTime");
const bestTimeEl = document.getElementById("bestTime");

const ROBOT_SPEED = 520;     // pixels por segundo
const EAT_DURATION = 300;    // ms que o robô “come” a luz
const ARRIVE_THRESHOLD = 10;  // distância mínima para considerar que chegou

let bb8X = 150;
let bb8Y = 150;
let targetX = bb8X;
let targetY = bb8Y;
let moving = false;
let eating = false;
let lastLightTime = 0;
let score = 0;
let bestTime = 0;

function setInitialPosition() {
  const rect = gameArea.getBoundingClientRect();
  bb8X = rect.width / 2;
  bb8Y = rect.height / 2;
  targetX = bb8X;
  targetY = bb8Y;
  updateBB8Position();
}

function updateBB8Position() {
  bb8.style.left = bb8X + "px";
  bb8.style.top = bb8Y + "px";
}

function placeLight(x, y) {
  light.style.left = x + "px";
  light.style.top = y + "px";
  light.classList.add("light-visible");
  light.style.opacity = "1";
}

function hideLight() {
  light.classList.remove("light-visible");
  light.style.opacity = "0";
}

function onClickGameArea(e) {
  if (e.target === light) return;

  const rect = gameArea.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const padding = 40;
  const clampedX = Math.min(rect.width - padding, Math.max(padding, clickX));
  const clampedY = Math.min(rect.height - padding, Math.max(padding, clickY));

  targetX = clampedX;
  targetY = clampedY;
  moving = true;
  eating = false;
  bb8.classList.add("bb8-moving");
  bb8.classList.remove("bb8-eating");

  const dx = targetX - bb8X;
  const dy = targetY - bb8Y;
  const angle = Math.atan2(dy, dx);
  const deg = angle * 180 / Math.PI;
  const tilt = Math.max(-10, Math.min(10, deg / 5));
  bb8.style.transform = "rotate(" + tilt + "deg)";

  placeLight(targetX, targetY);
  lastLightTime = performance.now();
}

function gameLoop(timestamp) {
  if (moving && !eating) {
    const dt = Math.min(32, timestamp - (gameLoop.lastTime || timestamp)) / 1000;
    const dx = targetX - bb8X;
    const dy = targetY - bb8Y;
    const distance = Math.hypot(dx, dy);

    if (distance < ARRIVE_THRESHOLD) {
      bb8X = targetX;
      bb8Y = targetY;
      updateBB8Position();
      moving = false;
      bb8.classList.remove("bb8-moving");
      startEating();
    } else {
      const vx = (dx / distance) * ROBOT_SPEED;
      const vy = (dy / distance) * ROBOT_SPEED;
      bb8X += vx * dt;
      bb8Y += vy * dt;
      updateBB8Position();
    }
  }

  gameLoop.lastTime = timestamp;
  requestAnimationFrame(gameLoop);
}

function startEating() {
  if (!light.classList.contains("light-visible")) return;
  eating = true;
  bb8.classList.add("bb8-eating");

  const now = performance.now();
  const travelTimeMs = now - lastLightTime;
  const travelTime = travelTimeMs / 1000;

  score++;
  scoreEl.textContent = score;

  lastTimeEl.textContent = travelTime.toFixed(2) + "s";
  if (bestTime === 0 || travelTime < bestTime) {
    bestTime = travelTime;
    bestTimeEl.textContent = bestTime.toFixed(2) + "s";
  }

  setTimeout(() => {
    hideLight();
    bb8.classList.remove("bb8-eating");
    eating = false;
  }, EAT_DURATION);
}

window.addEventListener("resize", setInitialPosition);
gameArea.addEventListener("click", onClickGameArea);

window.addEventListener("load", () => {
  setInitialPosition();
  requestAnimationFrame(gameLoop);
});
