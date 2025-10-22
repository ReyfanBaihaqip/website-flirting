(() => {
    // Pastikan semua kode dijalankan setelah DOM dimuat,
    // meskipun ini sudah menjadi praktik umum dalam file JS eksternal.

    // ===== Canvas stars (Bintang Berkedip) =====
    const canvas = document.getElementById('stars');
    // Cek jika canvas ada sebelum melanjutkan
    if (!canvas) {
        console.error("Elemen Canvas 'stars' tidak ditemukan.");
        return;
    }
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    const stars = [];
    // Hitungan bintang disesuaikan dengan ukuran layar
    const STAR_COUNT = Math.floor((w * h) / 12000); 

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Menginisialisasi posisi dan properti bintang
    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: rand(0, w),
                y: rand(0, h),
                r: rand(0.3, 1.6), // Radius bintang
                alpha: rand(0.2, 1), // Transparansi awal
                dr: rand(0.0005, 0.003) // Kecepatan kedip
            });
        }
    }

    // Menyesuaikan ukuran canvas dan menginisialisasi ulang bintang saat jendela diubah ukurannya
    function resize() {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
        initStars();
    }
    window.addEventListener('resize', resize);

    // Loop animasi untuk menggambar bintang yang berkedip
    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            // Logika kedip: mengubah alpha (transparansi) secara bolak-balik
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
    draw(); // Mulai animasi bintang berkedip

    // ===== Modal, Audio, & Bintang Jatuh =====
    const btn = document.getElementById('surpriseBtn');
    const modal = document.getElementById('modal');
    const close = document.getElementById('closeBtn');
    const audio = document.getElementById('bgMusic');

    // Cek keberadaan elemen sebelum menambahkan event listener
    if (!btn || !modal || !close || !audio) {
         console.error("Elemen UI atau Audio tidak lengkap.");
         // Lanjutkan hanya jika elemen inti tidak hilang
    }
    
    let fallbackInterval = null; // Variabel untuk menyimpan interval fallback

    // ===== Fungsi bintang jatuh (Jatuh Lurus) =====
    function createFallingStar() {
        const star = document.createElement('div');
        star.className = 'falling-star'; // Menggunakan class dari style.css
        
        // Posisi awal acak
        const startX = Math.random() * window.innerWidth;
        const startY = -Math.random() * 100; // Mulai dari luar atas
        const endY = window.innerHeight + 100;
        const duration = 2000 + Math.random() * 2000; // Durasi jatuh

        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        
        document.body.appendChild(star);

        // Animasi (Web Animations API)
        star.animate([
            { transform: `translateY(0px)`, opacity: 0.8 }, 
            { transform: `translateY(${endY}px)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'linear' 
        }).onfinish = () => star.remove();
    }
    
    // ===== Fungsi untuk memulai bintang jatuh berdasarkan waktu (Fallback) =====
    function startFallbackFallingStars() {
        if (!fallbackInterval) {
            // Munculkan 1-3 bintang setiap 500ms
            fallbackInterval = setInterval(() => {
                const count = Math.floor(rand(1, 3));
                for (let i = 0; i < count; i++) {
                    createFallingStar();
                }
            }, 500);
        }
    }

    // ===== Fungsi untuk menghentikan bintang jatuh (baik audio-reactive atau fallback) =====
    function stopFallbackFallingStars() {
        if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
        }
    }


    function openSurprise() {
        modal.classList.remove('hidden');
        // Gunakan timeout singkat untuk memastikan 'display: none' hilang
        setTimeout(() => {
            modal.classList.add('show'); // Aktifkan transisi fade + slide
        }, 10); 
        
        // Coba putar audio
        audio.play().catch(e => {
            console.warn('Audio play prevented. Memulai mode fallback bintang jatuh.', e);
            startFallbackFallingStars(); // Jika audio gagal, gunakan fallback
        });
    }

    function closeSurprise() {
        stopFallbackFallingStars(); // Hentikan fallback saat modal ditutup
        modal.classList.remove('show'); // Transisi keluar
        
        // Tunggu transisi CSS selesai (0.5s) sebelum menyembunyikan display
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 500); 

        audio.pause();
        audio.currentTime = 0;
    }
    
    // ===== Event Listeners =====
    btn.addEventListener('click', () => {
        // Aktifkan AudioContext jika disuspend
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                openSurprise();
            });
        } else {
            openSurprise();
        }
    });

    close.addEventListener('click', closeSurprise);
    
    // Tutup modal ketika mengklik area di luar modal-card
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSurprise();
    });

    // ===== Background moves with cursor (Efek Parallax) =====
    const sky = document.querySelector('.sky');
    document.addEventListener('mousemove', (e) => {
        // Menghitung persentase pergerakan dari tengah (-10 sampai 10)
        const xPercent = (e.clientX / window.innerWidth - 0.5) * 20;
        const yPercent = (e.clientY / window.innerHeight - 0.5) * 20;
        // Transformasi berlawanan arah untuk efek parallax yang benar
        sky.style.transform = `translate(${-xPercent}px, ${-yPercent}px) scale(1.05)`;
    });
    document.addEventListener('mouseleave', () => {
        sky.style.transform = 'translate(0px,0px) scale(1.05)';
    });


    // ===== Audio-reactive bintang (Membutuhkan audioCtx untuk bekerja) =====
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Cek jika audio dapat terhubung (mencegah error jika audio tidak valid/hilang)
    let audioSource;
    try {
        audioSource = audioCtx.createMediaElementSource(audio);
    } catch (e) {
        console.warn("Gagal membuat AudioSource (File instrumental.mp3 mungkin hilang). Hanya mode fallback yang akan bekerja.");
        // Nonaktifkan logika audio-reactive
        audioSource = null; 
    }
    
    if (audioSource) {
        const analyser = audioCtx.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationFrameId = null; // ID untuk mengontrol loop requestAnimationFrame

        function updateStarsWithMusic() {
            // Mendapatkan data frekuensi dari musik
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length; // Volume rata-rata

            // Threshold: Tentukan kapan harus memunculkan bintang (misalnya, jika volume > 40)
            if (avg > 40) {
                // Hentikan fallback saat musik aktif dan memiliki volume
                stopFallbackFallingStars(); 
                
                // Spawn bintang, semakin tinggi volume, semakin banyak bintang
                const starCount = Math.floor(avg / 50); 
                for (let i = 0; i < starCount; i++) createFallingStar();
            } else if (audio.paused === false) {
                 // Jika musik diputar tetapi volume sangat rendah, biarkan fallback berjalan (jika ada)
                 startFallbackFallingStars();
            }


            if (audio.paused === false) {
                 animationFrameId = requestAnimationFrame(updateStarsWithMusic);
            }
        }
        
        // Event listener untuk memulai loop saat audio benar-benar diputar
        audio.addEventListener('play', () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            if (!animationFrameId) {
                updateStarsWithMusic();
            }
        });
        
        // Event listener untuk menghentikan loop saat audio dihentikan
        audio.addEventListener('pause', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            stopFallbackFallingStars();
        });
    } else {
         // Jika AudioSource gagal dibuat, pastikan hanya mode fallback yang digunakan.
         audio.addEventListener('play', startFallbackFallingStars);
         audio.addEventListener('pause', stopFallbackFallingStars);
    }

})();
