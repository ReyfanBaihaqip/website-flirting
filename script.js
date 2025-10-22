(() => {
  // ===== Canvas stars =====
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const stars = [];
  const STAR_COUNT = Math.floor((w * h) / 12000);

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.3, 1.6),
        alpha: rand(0.2, 1),
        dr: rand(0.0005, 0.003)
      });
    }
  }

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    initStars();
  }
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.alpha += s.dr;
      if (s.alpha <= 0.2 || s.alpha >= 1) s.dr *= -1;
      ctx.beginPath();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = 'white';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  initStars();
  draw();

  // ===== Modal & audio =====
  const btn = document.getElementById('surpriseBtn');
  const modal = document.getElementById('modal');
  const close = document.getElementById('closeBtn');
  const audio = document.getElementById('bgMusic');

  // ===== Fungsi bintang jatuh =====
  function createFallingStar() {
    const star = document.createElement('div');
    star.style.position = 'fixed';
    star.style.top = '-10px';
    star.style.left = Math.random() * window.innerWidth + 'px';
    star.style.width = '4px';
    star.style.height = '4px';
    star.style.background = 'white';
    star.style.borderRadius = '50%';
    star.style.opacity = Math.random();
    star.style.pointerEvents = 'none';
    document.body.appendChild(star);

    const duration = 1000 + Math.random() * 1000;
    star.animate([
      { transform: `translateY(0px)` },
      { transform: `translateY(${window.innerHeight + 10}px)` }
    ], {
      duration: duration,
      easing: 'ease-out'
    }).onfinish = () => star.remove();
  }

  function openSurprise() {
    modal.classList.remove('hidden');
    modal.classList.add('show'); // aktifkan transisi
    audio.play().catch(e => console.warn('audio play prevented', e));
  }

  function closeSurprise() {
    modal.classList.remove('show'); // transisi keluar
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 500);
    audio.pause();
    audio.currentTime = 0;
  }

  btn.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume(); // aktifkan audioContext
    }
    openSurprise();
  });
  close.addEventListener('click', closeSurprise);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSurprise();
  });

  // ===== Background moves with cursor =====
  const sky = document.querySelector('.sky');
  document.addEventListener('mousemove', (e) => {
    const xPercent = (e.clientX / window.innerWidth - 0.5) * 20;
    const yPercent = (e.clientY / window.innerHeight - 0.5) * 20;
    sky.style.transform = `translate(${xPercent}px, ${yPercent}px) scale(1.05)`;
  });
  document.addEventListener('mouseleave', () => {
    sky.style.transform = 'translate(0px,0px) scale(1.05)';
  });

  // ===== Audio-reactive bintang =====
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioSource = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  audioSource.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function updateStarsWithMusic() {
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const avg = sum / dataArray.length;

    // threshold untuk spawn bintang
    if (avg > 100) {
      const starCount = Math.floor(avg / 25); 
      for (let i = 0; i < starCount; i++) createFallingStar();
    }

    requestAnimationFrame(updateStarsWithMusic);
  }

  // mulai audio-reactive bintang saat audio diputar
  audio.addEventListener('play', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    updateStarsWithMusic();
  });
})();
