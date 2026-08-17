/* =========================================
   KONFIGURASI
========================================= */
const birthdayConfig = {
    name: "Mellyani Indah Agustinna",
    nickname: "Meya",
    age: 24,
    targetDate: "2027-08-17T00:00:00+07:00",
    music: {
        // Lagu kemerdekaan sudah tidak dipakai di sini karena pakai Video
        birthday: "assets/music/birthday-song.mp3"
    },
    video: "assets/video/birthday-message.mp4",
    photos: [
        { image: "assets/images/photo1.jpg", caption: "Senyum yang selalu punya cerita." },
        { image: "assets/images/photo2.jpg", caption: "Salah satu kenangan yang indah." },
        { image: "assets/images/photo3.jpg", caption: "A moment worth remembering." },
        { image: "assets/images/photo4.jpg", caption: "Cantik." },
        { image: "assets/images/mode-hijab.jpg", caption: "Hijab of the day!." },
        { image: "assets/images/mode-mood.jpg", caption: "Mood booster!." },
        { image: "assets/images/muka-ngantor.jpg", caption: "Ngantor Cantik!." },
        { image: "assets/images/muka-ngupil.jpg", caption: "Ketahuan ngupil sama abang gojek hehe." },
        { image: "assets/images/muka-telor.jpg", caption: "Sarapan wajah telor." }
    ],
    finalPhoto: "assets/images/meya-final.jpg"
};

let countdownInterval, isAudioMuted = false, blowDetectionInterval;
let audioCtx, analyser, micStream;

/* PENGATURAN MEDIA (VIDEO & AUDIO) */
// Sekarang audioInd langsung mengambil sumber dari Video Background
const audioInd = document.getElementById('bg-video-countdown'); 
const audioBday = document.getElementById('audio-birthday');
const bdayVideo = document.getElementById('birthday-video');
const audioController = document.getElementById('audio-controller');

audioBday.src = birthdayConfig.music.birthday;
bdayVideo.src = birthdayConfig.video;
document.getElementById('final-photo').src = birthdayConfig.finalPhoto;

/* =========================================
   INITIALIZATION
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add('no-scroll');
    renderPhotoAlbum();
    generateCandles(birthdayConfig.age);
});

/* =========================================
   LOGIKA SWIPE (ANTI-NYANGKUT)
========================================= */
const swipeThumb = document.getElementById('swipe-thumb');
const swipeTrack = document.querySelector('.swipe-track');
const overlay = document.getElementById('start-overlay');
let isDragging = false, startX = 0, currentX = 0;

function getMaxDrag() { return swipeTrack.offsetWidth - swipeThumb.offsetWidth - 10; }

function startDrag(e) {
    isDragging = true;
    // Mendeteksi apakah sentuhan dari layar HP (touch) atau Mouse (klik PC)
    startX = (e.type === 'touchstart') ? e.touches[0].pageX : e.pageX;
    swipeThumb.style.transition = 'none';
}

function onDrag(e) {
    if (!isDragging) return;
    let currentEventX = (e.type === 'touchmove') ? e.touches[0].pageX : e.pageX;
    currentX = currentEventX - startX;
    
    const maxDrag = getMaxDrag();
    if (currentX < 0) currentX = 0;
    if (currentX > maxDrag) currentX = maxDrag;

    swipeThumb.style.transform = `translateX(${currentX}px)`;
    const textOpacity = 1 - (currentX / (maxDrag / 2));
    document.querySelector('.swipe-text').style.opacity = textOpacity > 0 ? textOpacity : 0;
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const maxDrag = getMaxDrag();
    
    if (currentX > maxDrag * 0.8) {
        swipeThumb.style.transform = `translateX(${maxDrag}px)`;
        
        // Memancing browser agar mengizinkan pemutaran video background bersuara
        if(audioInd) audioInd.play().catch(err => console.log(err));
        
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
            checkTimeAndStart();
        }, 500);
    } else {
        swipeThumb.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        swipeThumb.style.transform = `translateX(0px)`;
        document.querySelector('.swipe-text').style.opacity = 1;
        currentX = 0;
    }
}

// Event Listeners (Mouse & Touch)
swipeThumb.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

swipeThumb.addEventListener('touchstart', startDrag, { passive: true });
window.addEventListener('touchmove', onDrag, { passive: false });
window.addEventListener('touchend', endDrag);

document.getElementById('btn-mute').addEventListener('click', () => {
    isAudioMuted = !isAudioMuted;
    if(audioInd) audioInd.muted = isAudioMuted;
    if(audioBday) audioBday.muted = isAudioMuted;
    document.getElementById('btn-mute').innerText = isAudioMuted ? "🔇" : "🔊";
});

/* =========================================
   LOGIKA COUNTDOWN & FASE
========================================= */
function checkTimeAndStart() {
    const target = new Date(birthdayConfig.targetDate).getTime();
    const now = new Date().getTime();
    audioController.classList.remove('hidden');
    if (now >= target) startPhase2Directly();
    else startPhase1(target);
}

function startPhase1(target) {
    document.getElementById('phase-1-countdown').classList.remove('hidden');
    
    if(audioInd) {
        audioInd.volume = 0.5;
        audioInd.play().catch(e => console.log(e));
    }
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = target - now;

        if (distance <= 10000 && distance > 0) {
            clearInterval(countdownInterval);
            startDramaticCountdown(distance);
            return;
        }
        if (distance <= 0) {
            clearInterval(countdownInterval);
            startTransition();
            return;
        }

        document.getElementById('cd-days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById('cd-hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById('cd-minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById('cd-seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
    }, 1000);
}

function startDramaticCountdown(distanceLeft) {
    document.getElementById('phase-1-countdown').classList.add('hidden');
    const phaseDram = document.getElementById('phase-dramatic');
    phaseDram.classList.remove('hidden');
    const numEl = document.getElementById('dramatic-number');
    let seconds = Math.ceil(distanceLeft / 1000);
    numEl.innerText = seconds;

    const dramInt = setInterval(() => {
        seconds--;
        if (seconds > 0) numEl.innerText = seconds;
        else { clearInterval(dramInt); phaseDram.classList.add('hidden'); startTransition(); }
    }, 1000);
}

function startTransition() {
    crossfadeAudio(audioInd, audioBday);
    const transPhase = document.getElementById('phase-transition');
    const textEl = document.getElementById('transition-text');
    transPhase.classList.remove('hidden');

    const texts = ["17 AGUSTUS", "Tapi...", "Ada satu hal lagi tentang tanggal ini.", "Karena hari ini bukan hanya tentang kemerdekaan...", "...hari ini adalah hari lahir seseorang yang sangat spesial."];
    let i = 0;
    
    function showNext() {
        if (i < texts.length) {
            textEl.style.opacity = 0;
            setTimeout(() => {
                textEl.innerText = texts[i];
                textEl.style.opacity = 1;
                i++;
                setTimeout(showNext, 3000);
            }, 1000);
        } else {
            textEl.style.opacity = 0;
            setTimeout(() => { transPhase.classList.add('hidden'); initPhase2(); }, 1500);
        }
    }
    showNext();
}

function startPhase2Directly() {
    if(audioInd) audioInd.pause();
    audioBday.volume = 0.5;
    audioBday.play().catch(e => console.log(e));
    initPhase2();
}

function initPhase2() {
    document.body.classList.remove('no-scroll');
    document.getElementById('phase-2-birthday').classList.remove('hidden');
    document.getElementById('audio-label').innerText = "🎂 Birthday Mode";

    // INI DIA YANG KETINGGALAN: Memanggil partikel agar muncul!
    createHearts();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.2 });
    document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));
    
    document.getElementById('btn-scroll-down').addEventListener('click', () => { window.scrollBy({ top: window.innerHeight, behavior: 'smooth' }); });
    initMicrophone();
}

function crossfadeAudio(aOut, aIn) {
    let vOut = 0.5, vIn = 0;
    aIn.volume = 0; aIn.play().catch(e => console.log(e));
    const fade = setInterval(() => {
        vOut -= 0.05; vIn += 0.05;
        if (vOut <= 0) { 
            if(aOut) { aOut.pause(); aOut.volume = 0; }
            clearInterval(fade); 
        } 
        else { 
            if(aOut) aOut.volume = vOut; 
            aIn.volume = vIn; 
        }
    }, 200);
}
audioBday.addEventListener("ended", startPhase3Video);

/* =========================================
   ALBUM & LILIN
========================================= */
function renderPhotoAlbum() {
    const gallery = document.getElementById('photo-gallery');
    birthdayConfig.photos.forEach(p => {
        const c = document.createElement('div');
        c.className = 'photo-card';
        c.innerHTML = `<img src="${p.image}"><div class="photo-caption">${p.caption}</div>`;
        c.addEventListener('click', () => openLightbox(p.image, p.caption));
        gallery.appendChild(c);
    });
}
function openLightbox(src, cap) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').innerText = cap;
    document.getElementById('lightbox').classList.add('active');
}
document.getElementById('lightbox-close').addEventListener('click', () => document.getElementById('lightbox').classList.remove('active'));

function generateCandles(count) {
    const c = document.getElementById('candles-container');
    for (let i = 0; i < count; i++) {
        c.innerHTML += `<div class="candle-wrapper"><div class="flame"></div><div class="candle"></div></div>`;
    }
}

document.getElementById('btn-blow-fallback').addEventListener('click', blowOutCandles);
function initMicrophone() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            micStream = stream;
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            audioCtx.createMediaStreamSource(stream).connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            blowDetectionInterval = setInterval(() => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
                if ((sum / dataArray.length) > 80) blowOutCandles();
            }, 200);
        }).catch(e => console.log("Mic ditolak"));
    }
}
let candlesBlown = false;
function blowOutCandles() {
    if (candlesBlown) return;
    candlesBlown = true;
    if (blowDetectionInterval) clearInterval(blowDetectionInterval);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    document.querySelectorAll('.flame').forEach(f => f.classList.add('extinguished'));
    document.getElementById('mic-status').innerText = "DUAR🔥! Selamat ulang tahun yang ke 24! Tunggu hingga lagunya selesai diputar ya...";
    document.getElementById('btn-blow-fallback').style.display = 'none';
}

/* =========================================
   VIDEO & FINAL
========================================= */
function startPhase3Video() {
    document.body.classList.add('no-scroll');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    audioController.classList.add('hidden');
    document.getElementById('phase-2-birthday').classList.add('hidden');
    document.getElementById('phase-3-video').classList.remove('hidden');
    
    const intro = document.getElementById('video-intro');
    const texts = ["Tunggu...", "Masih ada satu pesan terakhir untukmu.", "❤️"];
    let i = 0;
    function showIntro() {
        if (i < texts.length) {
            intro.style.opacity = 0;
            setTimeout(() => { intro.innerText = texts[i]; intro.style.opacity = 1; i++; setTimeout(showIntro, 2500); }, 1000);
        } else {
            intro.style.opacity = 0;
            setTimeout(() => { 
                document.getElementById('video-container').classList.remove('hidden');
                const p = bdayVideo.play();
                if (p !== undefined) p.catch(() => {
                    const b = document.getElementById('btn-play-video');
                    b.classList.remove('hidden');
                    b.addEventListener('click', () => { bdayVideo.play(); b.classList.add('hidden'); });
                });
            }, 1000);
        }
    }
    showIntro();
}
bdayVideo.addEventListener("ended", () => {
    document.getElementById('phase-3-video').classList.add('hidden');
    document.getElementById('phase-4-final').classList.remove('hidden');
    setTimeout(() => document.querySelectorAll('#phase-4-final .text-fade').forEach(el => el.classList.add('visible')), 500);
});

/* =========================================
   PARTIKEL LOVE (GIRLY BACKGROUND)
========================================= */
function createHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    
    // Variasi partikel yang akan muncul
    const heartIcons = ['❤️', '💖', '💕', '🌸', '✨']; 
    
    // Membuat 35 partikel
    for (let i = 0; i < 35; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerText = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        
        // Mengacak posisi, ukuran, dan kecepatan
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 10 + 8) + 's'; // 8-18 detik
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
        
        container.appendChild(heart);
    }
}