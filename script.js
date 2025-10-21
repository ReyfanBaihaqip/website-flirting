const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const bgMusic = document.getElementById("bgMusic");
const startBtn = document.getElementById("startBtn");
const thankYou = document.getElementById("thankYou");
const playAgain = document.getElementById("playAgain");
const closeBtn = document.getElementById("closeBtn");
const scoreText = document.getElementById("score");
const finalScore = document.getElementById("finalScore");

let stars = [];
let hearts = [];
let score = 0;
let time = 30;
let gameInterval;
let timeInterval;

// bintang jatuh
class Star {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 3 + 1;
    this.speed = Math.random() * 2 + 2;
    this.opacity = Math.random();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 8;
    ctx.fill();
  }
  update() {
    this.x += 1.5;
    this.y += this.speed;
    if (this.y > canvas.height) this.reset();
  }
}

// partikel cinta
class Heart {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 8 + 4;
    this.speed = Math.random() * 1 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.3;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 150, 200, ${this.opacity})`;
    ctx.moveTo(this.x, this.y);
    ctx.bezierCurveTo(this.x - this.size, this.y - this.size,
                      this.x - this.size * 1.5, this.y + this.size / 2,
                      this.x, this.y + this.size);
    ctx.bezierCurveTo(this.x + this.size * 1.5, this.y + this.size / 2,
                      this.x + this.size, this.y - this.size,
                      this.x, this.y);
    ctx.fill();
  }
  update() {
    this.y += this.speed;
    if (this.y > canvas.height) this.y = -10;
  }
}

function createStars(num) {
  for (let i = 0; i < num; i++) stars.push(new Star());
}
function createHearts(num) {
  for (let i = 0; i < num; i++) hearts.push(new Heart());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach((s) => { s.update(); s.draw(); });
  hearts.forEach((h) => { h.update(); h.draw(); });
  requestAnimationFrame(animate);
}

createStars(80);
createHearts(20);
animate();

// interaksi klik bintang
canvas.addEventListener("click", (e) => {
  stars.forEach((s) => {
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) {
      score++;
      s.reset();
      scoreText.textContent = `Score: ${score} | Time: ${time}s`;
    }
  });
});

function startGame() {
  score = 0;
  time = 30;
  thankYou.style.display = "none";
  scoreText.textContent = `Score: ${score} | Time: ${time}s`;
  bgMusic.play();

  clearInterval(gameInterval);
  clearInterval(timeInterval);

  timeInterval = setInterval(() => {
    time--;
    scoreText.textContent = `Score: ${score} | Time: ${time}s`;
    if (time <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timeInterval);
  bgMusic.pause();
  bgMusic.currentTime = 0;
  finalScore.textContent = score;
  document.body.classList.add("fadeSky");
  thankYou.style.display = "flex";
}

startBtn.addEventListener("click", startGame);
playAgain.addEventListener("click", () => {
  document.body.classList.remove("fadeSky");
  startGame();
});
closeBtn.addEventListener("click", () => {
  thankYou.style.display = "none";
});

window.onload = () => {
  thankYou.style.display = "none";
};
