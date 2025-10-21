console.log("✅ Script loaded successfully");

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
let score = 0;
let timeLeft = 30;
let playing = false;
let timerInterval;

const startBtn = document.getElementById("startBtn");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const scoreWrap = document.getElementById("scoreWrap");
const thankYou = document.getElementById("thankYou");
const bgMusic = document.getElementById("bgMusic");

window.onload = () => {
  thankYou.style.display = "none";
};

// buat bintang
class Star {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 3 + 2;
    this.speed = Math.random() * 2 + 1;
    this.angle = Math.random() * Math.PI / 4;
  }
  update() {
    this.x += this.speed * Math.sin(this.angle);
    this.y += this.speed * Math.cos(this.angle);
    if (this.y > canvas.height + 10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// efek partikel cinta
class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.size = 5;
  }
  update() {
    this.y += 1;
    this.alpha -= 0.02;
  }
  draw() {
    ctx.fillStyle = `rgba(255,192,203,${this.alpha})`;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x - 2, this.y - 2, this.size / 2, 0, Math.PI, true);
    ctx.arc(this.x + 2, this.y - 2, this.size / 2, 0, Math.PI, true);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.fill();
  }
}

const hearts = [];

// klik bintang
canvas.addEventListener("click", (e) => {
  if (!playing) return;
  const { x, y } = e;
  stars.forEach((star) => {
    if (Math.hypot(star.x - x, star.y - y) < 10) {
      score++;
      scoreDisplay.textContent = score;
      hearts.push(new Heart(star.x, star.y));
      star.reset();
    }
  });
});

// animasi utama
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach((s) => {
    s.update();
    s.draw();
  });
  hearts.forEach((h, i) => {
    h.update();
    h.draw();
    if (h.alpha <= 0) hearts.splice(i, 1);
  });
  if (playing) requestAnimationFrame(animate);
}

// mulai game
startBtn.addEventListener("click", () => {
  startGame();
});

function startGame() {
  playing = true;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  scoreWrap.classList.remove("hidden");
  thankYou.style.display = "none";
  document.body.classList.remove("fade-end");
  bgMusic.play();

  stars.length = 0;
  for (let i = 0; i < 100; i++) {
    stars.push(new Star());
  }

  animate();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// akhir game
function endGame() {
  playing = false;
  clearInterval(timerInterval);
  bgMusic.pause();
  thankYou.style.display = "block";
  document.body.classList.add("fade-end");
}
