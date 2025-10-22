(() => {
    const scene = document.getElementById('scene');
    const canvas = document.getElementById('stars');
    const surpriseBtn = document.getElementById('surpriseBtn');
    const modal = document.getElementById('modal');
    const bgMusic = document.getElementById('bgMusic');

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    const stars = [];
    const shootingStars = []; // Array untuk bintang jatuh
    const STAR_COUNT = Math.floor((w * h) / 12000);

    let isTraveling = false; // Efek streak kecepatan tinggi
    let isDrifting = false; // Gerak bintang halus saat melihat Bulan
    let isShootingStarActive = false; // Flag untuk mengontrol generasi bintang jatuh

    // Variabel untuk pergerakan halus bintang saat drifting
    let starDriftX = 0;
    let starDriftY = 0;
    const SLOW_DRIFT_SPEED_X = 0.5; // Lebih cepat ke kanan
    const SLOW_DRIFT_SPEED_Y = 0.8; // Lebih cepat ke bawah (simulasi maju)
    
    // ===== KONSTANTA UNTUK SINKRONISASI WAKTU (semua dalam ms) =====
    const STREAK_DURATION = 4000;      // Bintang jatuh cepat (4 detik)
    const FLASH_MODAL_DURATION = 2500; // Durasi modal terlihat (2.5 detik)
    const MOON_GROW_DURATION = 3000;   // Animasi membesarnya Bulan (dari CSS)
    
    function rand(min, max) { return Math.random() * (max - min) + min; }

    // Fungsi untuk membuat bintang jatuh
    function createShootingStar() {
        // Mulai dari area acak di bagian atas (lebih lebar)
        const startX = rand(w * 0.1, w * 0.9); 
        const startY = -50; // Mulai sedikit di luar layar atas
        
        const star = {
            x: startX, 
            y: startY,
            // Gerakan diagonal
            vx: rand(-3, 3),  // Variasi arah horizontal
            vy: rand(8, 15),  // Lebih cepat ke bawah
            length: rand(70, 200), // Panjang ekor
            opacity: 1,
            fadeRate: rand(0.008, 0.02) // Pudar
        };
        shootingStars.push(star);
    }
    
    // Fungsi yang mengatur interval pembuatan bintang jatuh
    function startShootingStarGeneration() {
        if (!isShootingStarActive) return;

        // Buat bintang baru
        createShootingStar();

        // Jadwalkan pembuatan bintang berikutnya (antara 1 hingga 5 detik)
        const nextTime = rand(1000, 5000); 
        setTimeout(startShootingStarGeneration, nextTime);
    }


    // ===== BINTANG CANVAS: LOGIKA STREAKING & DRIFT HALUS =====
    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: rand(0, w), y: rand(0, h),
                r: rand(0.3, 1.6), alpha: rand(0.2, 1),
                dr: rand(0.0005, 0.003) // Kecepatan kedip
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, w, h);

        // Perhitungan Drift hanya jika isDrifting aktif
        if (isDrifting) {
            starDriftX += SLOW_DRIFT_SPEED_X; 
            starDriftY += SLOW_DRIFT_SPEED_Y; 
        } else {
            starDriftX = 0; 
            starDriftY = 0;
        }

        // 1. DRAW NORMAL/STREAKING/DRIFTING STARS
        for (let star of stars) {
            // Update alpha untuk efek kedip normal
            star.alpha += star.dr;
            if (star.alpha > 1) { star.alpha = 1; star.dr *= -1; } 
            else if (star.alpha < 0.2) { star.alpha = 0.2; star.dr *= -1; }

            if (isTraveling) {
                // EFEK STREAKING (Perjalanan Cepat)
                const streakLength = 30 * (star.r); 
                const streakSpeed = 50; 
                star.y = (star.y + streakSpeed); 
                if (star.y > h) { star.y = 0; }
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x, star.y - streakLength); 
                ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.lineWidth = 1; 
                ctx.stroke();

            } else if (isDrifting) { 
                // EFEK PERGERAKAN HALUS (Drift)
                star.y += SLOW_DRIFT_SPEED_Y; 
                star.x += (Math.sin(star.y * 0.01) * SLOW_DRIFT_SPEED_X * 0.5); 

                // Reset posisi jika keluar layar
                if (star.y > h) { 
                    star.y = 0; 
                    star.x = rand(0, w);
                }
                if (star.x < 0 || star.x > w) { 
                    star.x = rand(0, w);
                }

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2, false);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();

            } else {
                // GAMBAR NORMAL (Titik Statis)
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2, false);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            }
        }
        
        // 2. --- DRAW SHOOTING STARS ---
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];

            // Update posisi dan opacity
            star.x += star.vx;
            star.y += star.vy;
            star.opacity -= star.fadeRate;

            // Gambar kepala bintang
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();

            // Gambar ekor/streak
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.vx * (star.length / star.vy), star.y - star.length);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * 0.6})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hapus jika sudah di luar layar atau sudah pudar
            if (star.y > h + star.length || star.x < 0 - star.length || star.x > w + star.length || star.opacity <= 0) {
                shootingStars.splice(i, 1);
            }
        }

        requestAnimationFrame(drawStars);
    }

    initStars();
    drawStars();

    window.addEventListener('resize', () => {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
        initStars();
    });
    
    // Inisialisasi Audio (Simplified)
    if (bgMusic) {
        bgMusic.addEventListener('play', () => {
            console.log("Musik mulai diputar.");
        });
        bgMusic.addEventListener('pause', () => {
            console.log("Musik dijeda.");
        });
    }

    // Fungsi untuk menetap di Deep Space dan memulai animasi latar belakang
    function settleIntoDeepSpace() {
        // 1. Tambahkan kelas deep-space-final segera (memulai animasi Bulan & Zoom Latar Belakang)
        scene.classList.add('deep-space-final'); 

        // 2. Pastikan modal disembunyikan sepenuhnya
        modal.classList.add('hidden');
        
        // 3. Setelah Bulan selesai membesar (3000ms), aktifkan bintang jatuh
        setTimeout(() => {
            // isDrifting tetap true untuk simulasi gerak maju background
            isShootingStarActive = true; // AKTIFKAN GENERASI BINTANG JATUH
            startShootingStarGeneration();
        }, MOON_GROW_DURATION);
    }
    
    // ===== LOGIKA TOMBOL & TRANSISI UTAMA =====
    function openModal() {
        // Hapus deep-space-final jika ada (untuk reset dan re-run animasi)
        scene.classList.remove('deep-space-final');
        isShootingStarActive = false; // Matikan bintang jatuh
        shootingStars.length = 0; // Bersihkan bintang jatuh

        // 1. EFEK PERJALANAN DIMULAI: Streaking
        isTraveling = true;
        scene.classList.add('traveling-mode');

        // 2. MUSIC PAUSE
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
        }

        // --- FLASH LOGIC (Independent) ---
        setTimeout(() => {
            // 1. FLASH MODAL: Munculkan dengan cepat
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.add('show'); // Modal is now visible
            }, 10);

            // 2. Hilangkan Modal setelah FLASH_MODAL_DURATION (2500ms)
            setTimeout(() => {
                // Mulai fade out modal
                modal.classList.remove('show'); 
            }, FLASH_MODAL_DURATION); 

        }, 1000); // Flash dimulai 1000ms setelah streak dimulai (T=1000ms)

        // --- SEQUENCE END LOGIC (Ketika streak selesai) ---
        setTimeout(() => {
            isTraveling = false; // Stop Streaking
            isDrifting = true;   // Start Slow Drifting (simulasi gerak maju)
            
            // SINKRONISASI: Bulan membesar TEPAT saat streak berhenti (T=4000ms)
            settleIntoDeepSpace(); 

        }, STREAK_DURATION); // Streak ends at 4000ms
    }

    // Event listeners
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', openModal);
    }
    
    // Logika untuk memulai musik saat interaksi pertama
    if (bgMusic && surpriseBtn) {
        surpriseBtn.addEventListener('click', () => {
            bgMusic.volume = 0.6;
            bgMusic.play().catch(e => {
                console.warn("Autoplay diblokir, silakan coba interaksi lagi.");
            });
        }, { once: true });
    }
})();