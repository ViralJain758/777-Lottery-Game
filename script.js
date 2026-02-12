const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
];

const btn = document.getElementById("controlBtn");
const statusText = document.getElementById("status");
const lever = document.querySelector(".lever");

const SYMBOLS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const SYMBOL_HEIGHT = 150;
const STRIP_SIZE = 80;

const speeds = [15, 20, 25]; // px per frame ~ visible difference

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
  document.body.classList.remove("win-dim");

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
  machine.classList.remove("jackpot");
  document.body.classList.remove("win-dim");

  if (vals.every((v) => "8" === v)) {
    statusText.textContent = "🔥 PERFECT 888!";
    statusText.style.color = "gold";

    machine.classList.add("win");
    machine.classList.add("jackpot");
    document.body.classList.add("win-dim");
    fireConfetti();
  } else if (vals[0] === vals[1] && vals[1] === vals[2]) {
    statusText.textContent = "🎯 MATCH! BUT 888 WAS EXPECTED!";
    statusText.style.color = "gold";

    machine.classList.add("win");
  } else {
    statusText.textContent = "💀 Miss!";
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

document.addEventListener("keydown", (e) => {
  if (!["Enter", "Space"].includes(e.code)) return;
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

/* ===== FULLSCREEN TOGGLE ===== */

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() !== "f") return;

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
});
/* ===== CONFETTI BLAST ON JACKPOT ===== */

const confettiLayer = document.querySelector(".confetti-layer");

function fireConfetti() {
  confettiLayer.innerHTML = "";
  confettiLayer.classList.add("active");

  for (let i = 0; i < 90; i++) {
    const c = document.createElement("div");
    c.className = "confetti";

    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 0.6 + "s";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;

    confettiLayer.appendChild(c);
  }

  setTimeout(() => {
    confettiLayer.classList.remove("active");
    confettiLayer.innerHTML = "";
  }, 2200);
}

/* =====================================================
   RESPONSIVE AUTO SCALE
===================================================== */

function fitMachine() {
  const wrapper = document.querySelector(".slot-wrapper");

  const vh = window.innerHeight;
  const machine = document.querySelector(".machine");

  const rect = machine.getBoundingClientRect();

  const usable = vh * 0.92;

  let scale = usable / rect.height;

  scale = Math.min(Math.max(scale, 0.7), 1.25);

  wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", fitMachine);
window.addEventListener("orientationchange", fitMachine);

setTimeout(fitMachine, 100);
