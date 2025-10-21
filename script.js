// For You - interactive sky + falling stars click-minigame + heart particles
(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;

  // UI
  const startBtn = document.getElementById('startBtn');
  const scoreWrap = document.getElementById('scoreWrap');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const resultModal = document.getElementById('resultModal');
  const finalScore = document.getElementById('finalScore');
  const replayBtn = document.getElementById('replayBtn');
  const closeLink = document.getElementById('closeLink');
  const bgMusic = document.getElementById('bgMusic');

  // Game vars
  let stars = [];         // falling star objects
  let hearts = [];        // particle hearts
  let staticStars = [];   // background twinkle stars
  let mouse = {x: W/2, y: H/2};
  let score = 0;
  let running = false;
  let spawnTimer = 0;
  let timeLeft = 30; // seconds
  let lastTime = performance.now();

  // settings
  const GAME_DURATION = 30;
  const SPAWN_INTERVAL = 700; // ms
  const MAX_STARS = 24;

  // helpers
  function rand(min, max){ return Math.random()*(max-min)+min; }

  // create background twinkle stars
  function createStaticStars(count=120){
    staticStars = [];
    for(let i=0;i<count;i++){
      staticStars.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: Math.random()*1.6+0.2,
        phase: Math.random()*Math.PI*2,
        speed: rand(0.002,0.008)
      });
    }
  }

  // spawn a falling star from left-top area going to right-bottom
  function spawnFallingStar(){
    if(stars.length >= MAX_STARS) return;
    const startX = rand(-W*0.05, W*0.25);    // more to left
    const startY = rand(-H*0.05, H*0.25);    // more to top
    const speed = rand(120, 260); // pixels/sec
    const angle = Math.PI/4 + rand(-0.18,0.18); // ~45deg downward
    stars.push({
      x: startX, y: startY,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      r: rand(6,12),
      rot: rand(0,Math.PI*2),
      life: 0,
      ttl: rand(5,10) // seconds
    });
  }

  // hearts particle effect
  function spawnHearts(x,y, count=10){
    for(let i=0;i<count;i++){
      hearts.push({
        x, y,
        vx: rand(-80,80),
        vy: rand(-220,-60),
        size: rand(6,14),
        life: 0,
        ttl: rand(0.8,1.6),
        rot: rand(0,Math.PI*2),
        color: `rgba(255,${Math.floor(rand(120,220))},${Math.floor(rand(170,255))},`
      });
    }
  }

  // resize handler
  addEventListener('resize', ()=> {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    createStaticStars( Math.floor((W*H)/7000) );
  });

  // cursor influence for mild parallax
  addEventListener('mousemove', (e)=> {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // click detection
  canvas.addEventListener('click', (e)=>{
    if(!running) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // check stars for hit (use distance)
    for(let i=stars.length-1;i>=0;i--){
      const s = stars[i];
      const dx = s.x - cx;
      const dy = s.y - cy;
      if(Math.hypot(dx,dy) <= s.r + 6){
        // hit!
        score += 1;
        scoreEl.textContent = score;
        // spawn hearts at star pos
        spawnHearts(s.x, s.y, 14);
        // remove star
        stars.splice(i,1);
        // small pop sound - optional (not included)
        return;
      }
    }
  });

  // game loop
  function update(dt){
    // spawn falling stars periodically
    spawnTimer += dt*1000;
    if(spawnTimer > SPAWN_INTERVAL){
      spawnTimer = 0;
      spawnFallingStar();
    }

    // update stars
    for(let i = stars.length-1; i>=0; i--){
      const s = stars[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life += dt;
      s.rot += dt*2;
      // remove if out of bounds or too old
      if(s.x > W + 200 || s.y > H + 200 || s.life > s.ttl){
        stars.splice(i,1);
      }
    }

    // update hearts
    for(let i=hearts.length-1;i>=0;i--){
      const p = hearts[i];
      p.vy += 600 * dt; // gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      if(p.life > p.ttl) hearts.splice(i,1);
    }

    // update static star twinkle
    for(const st of staticStars){
      st.phase += st.speed * dt * 60;
    }
  }

  function draw(){
    // clear
    ctx.clearRect(0,0,W,H);

    // mild radial glow / nebula at center-bottom
    const g = ctx.createRadialGradient(W*0.5, H*0.6, 50, W*0.5, H*0.6, Math.max(W,H));
    g.addColorStop(0, 'rgba(8,7,20,0.45)');
    g.addColorStop(1, 'rgba(2,1,12,0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // draw static twinkle stars
    for(const st of staticStars){
      const a = 0.25 + 0.75*(0.5 + 0.5*Math.sin(st.phase));
      ctx.globalAlpha = a;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(st.x + (mouse.x - W/2)*0.02, st.y + (mouse.y - H/2)*0.02, st.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // draw falling stars (glowing comet-like)
    for(const s of stars){
      // glow
      const grad = ctx.createLinearGradient(s.x - 20, s.y - 10, s.x + 20, s.y + 10);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.4, 'rgba(255,220,255,0.6)');
      grad.addColorStop(1, 'rgba(255,220,255,0.0)');
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(Math.atan2(s.vy, s.vx));
      // tail
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = grad;
      ctx.fillRect(-s.r*6, -s.r*0.45, s.r*8, s.r*0.9);
      // core
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.arc(0, 0, s.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // draw hearts particles
    for(const p of hearts){
      const lifeRatio = 1 - (p.life / p.ttl);
      ctx.save();
      ctx.globalAlpha = Math.max(0, lifeRatio);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + p.life * 4);
      // heart shape (simple)
      ctx.beginPath();
      const size = p.size;
      ctx.moveTo(0, -size/2);
      ctx.bezierCurveTo(size/2, -size*0.9, size*1.1, -size*0.1, 0, size);
      ctx.bezierCurveTo(-size*1.1, -size*0.1, -size/2, -size*0.9, 0, -size/2);
      ctx.closePath();
      ctx.fillStyle = p.color + (0.75 + 0.25*Math.random()) + ')';
      ctx.fill();
      ctx.restore();
    }

    // subtle vignette
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  // game timer loop
  function tick(now){
    const dt = Math.min(0.05, (now - lastTime)/1000);
    lastTime = now;
    if(running){
      update(dt);
    }
    // draw is handled by its own RAF, but keep updating
    requestAnimationFrame(tick);
  }

  // start game
  function startGame(){
    if(running) return;
    // reset
    stars = [];
    hearts = [];
    score = 0;
    scoreEl.textContent = 0;
    timeLeft = GAME_DURATION;
    timeEl.textContent = timeLeft;
    scoreWrap.classList.remove('hidden');
    startBtn.disabled = true;
    running = true;
    spawnTimer = 0;
    lastTime = performance.now();
    // play music (user gesture)
    bgMusic.currentTime = 0;
    bgMusic.play().catch(()=>{/*some browsers block autoplay if not gesture; start button is gesture so usually ok*/});
    // countdown
    const interval = setInterval(()=>{
      if(!running){ clearInterval(interval); return; }
      timeLeft--;
      timeEl.textContent = timeLeft;
      if(timeLeft <= 0){
        running = false;
        clearInterval(interval);
        endGame();
      }
    }, 1000);
  }

  function endGame(){
    // stop music
    try{ bgMusic.pause(); bgMusic.currentTime = 0; } catch(e){}
    finalScore.textContent = score;
    resultModal.classList.remove('hidden');
  }

  // replay
  replayBtn.addEventListener('click', ()=>{
    resultModal.classList.add('hidden');
    startBtn.disabled = false;
    startGame();
  });

  closeLink.addEventListener('click', (e)=>{
    e.preventDefault();
    resultModal.classList.add('hidden');
    startBtn.disabled = false;
  });

  startBtn.addEventListener('click', ()=>{
    // reveal score UI
    scoreWrap.classList.remove('hidden');
    startGame();
  });

  // initial setup
  createStaticStars(Math.floor((W*H)/7000));
  // run draw + tick
  draw();
  requestAnimationFrame(tick);

})();
