// Ambil elemen
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");
const bgMusic = document.getElementById("bgMusic");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const resultModal = document.getElementById("resultModal");
const finalScore = document.getElementById("finalScore");
const closeLink = document.getElementById("closeLink");

let stars = [];
let score = 0;
let timeLeft = 30;
let gameInterval, timerInterval;
let playing = false;

// Atur ukuran canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Bintang
class Star {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 1 + 0.3;
    this.speedY = Math.random() * 3 + 1.5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y > canvas.height || this.x > canvas.width) {
      this.reset();
      this.y = -10;
    }
  }
  draw() {
    ctx.beginPath();
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Buat bintang awal
for (let i = 0; i < 80; i++) stars.push(new Star());

// Animasi langit
function animate() {
  if (!playing) return;
  ctx.fillStyle = "rgba(0,0,20,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let star of stars) {
    star.update();
    star.draw();
  }

  requestAnimationFrame(animate);
}

// Klik bintang
canvas.addEventListener("click", (e) => {
  if (!playing) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const dx = s.x - mouseX;
    const dy = s.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      score++;
      scoreEl.textContent = score;
      stars.splice(i, 1);
      stars.push(new Star());
      break;
    }
  }
});

// Mulai game
function startGame() {
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = 0;
  timeEl.textContent = timeLeft;
  document.getElementById("scoreWrap").classList.remove("hidden");
  resultModal.classList.add("hidden");
  playing = true;
  bgMusic.play();
  animate();

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// Akhiri game
function endGame() {
  playing = false;
  clearInterval(timerInterval);
  bgMusic.pause();
  finalScore.textContent = score;
  resultModal.classList.remove("hidden");
}

// Ulangi game
function replayGame() {
  resultModal.classList.add("hidden");
  startGame();
}

// Event listener
startBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", replayGame);
closeLink.addEventListener("click", () => {
  resultModal.classList.add("hidden");
});
