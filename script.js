const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
];

const btn = document.getElementById("controlBtn");
const statusText = document.getElementById("status");
const lever = document.querySelector(".lever");

const SYMBOLS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const SYMBOL_HEIGHT = 120;
const STRIP_SIZE = 80;

const speeds = [6, 7.5, 9]; // px per frame ~ visible difference

let rafIds = [0, 0, 0];
let positions = [0, 0, 0];
let running = [false, false, false];
let stopIndex = 0;

function buildStrip(reel) {
  reel.innerHTML = "";

  for (let i = 0; i < STRIP_SIZE; i++) {
    const d = document.createElement("div");
    d.className = "symbol";
    d.textContent = SYMBOLS[i % SYMBOLS.length];

    reel.appendChild(d);
  }
}

reels.forEach(buildStrip);

function triggerSpin() {
  if (!running.some((v) => v)) startSpin();
  else stopNext();
}

btn.onclick = triggerSpin;

function startSpin() {
  const machine = document.querySelector(".machine");

  machine.classList.remove("win");

  statusText.textContent = "";
  btn.textContent = "STOP";
  stopIndex = 0;

  reels.forEach((reel, i) => {
    buildStrip(reel);

    running[i] = true;
    positions[i] = 0;

    loop(i);
  });
}

function loop(i) {
  if (!running[i]) return;

  positions[i] += speeds[i];

  const maxScroll = SYMBOL_HEIGHT * STRIP_SIZE;
  if (positions[i] >= maxScroll - SYMBOL_HEIGHT * 4) {
    positions[i] = positions[i] % SYMBOL_HEIGHT;
  }

  reels[i].style.transform = `translateY(-${positions[i]}px)`;

  rafIds[i] = requestAnimationFrame(() => loop(i));
}

function stopNext() {
  if (stopIndex >= 3) return;

  const i = stopIndex;

  running[i] = false;
  cancelAnimationFrame(rafIds[i]);

  reels[i].classList.remove("spin-blur");

  snapToGrid(i);

  stopIndex++;

  if (stopIndex === 3) {
    btn.textContent = "SPIN";
    checkWin();
  }
}

function snapToGrid(i) {
  const idx = Math.round(positions[i] / SYMBOL_HEIGHT);

  const final = idx * SYMBOL_HEIGHT;

  reels[i].style.transition = "0.05s ease-out";
  reels[i].style.transform = `translateY(-${final}px)`;

  positions[i] = final;

  setTimeout(() => {
    reels[i].style.transition = "";
  }, 150);
}

function visibleSymbol(i) {
  const idx = Math.round(positions[i] / SYMBOL_HEIGHT);
  return reels[i].children[idx].textContent;
}

function checkWin() {
  const vals = [0, 1, 2].map(visibleSymbol);

  const machine = document.querySelector(".machine");

  machine.classList.remove("win");

  if (vals.every((v) => "7" === v)) {
    statusText.textContent = "🔥 PERFECT 777!";
    statusText.style.color = "lime";

    machine.classList.add("win");
  } else if (vals[0] === vals[1] && vals[1] === vals[2]) {
    statusText.textContent = "🎯 MATCH!";
    statusText.style.color = "gold";

    machine.classList.add("win");
  } else {
    statusText.textContent = "Miss!";
    statusText.style.color = "orange";
  }
}

let leverLocked = false;

lever.addEventListener("click", () => {
  if (leverLocked) return;

  leverLocked = true;

  triggerSpin();

  document.querySelector(".machine").classList.add("shake");

  lever.classList.add("pull");

  setTimeout(() => {
    lever.classList.remove("pull");
    leverLocked = false;
    document.querySelector(".machine").classList.remove("shake");
  }, 180);
});
