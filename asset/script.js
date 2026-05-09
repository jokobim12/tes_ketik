/**
 * KetikCepat - Typing Test Engine
 * Vanilla JavaScript implementation
 */

// Fallback Word List (Common Indonesian Words)
const INDO_WORDS = [
    "ada", "adalah", "akan", "aku", "anda", "apa", "atau", "bagi", "bahwa", "baik", "banyak", "baru", "beberapa", "begitu", "belum", "besar", "bisa", "boleh", "bukan", "cara", "dalam", "dan", "dapat", "dari", "datang", "dengan", "depan", "di", "dia", "dimana", "diri", "dua", "dunia", "hal", "hampir", "hanya", "hari", "harus", "hati", "hidup", "ia", "ingin", "ini", "itu", "jadi", "jangan", "jauh", "jika", "juga", "kami", "kamu", "karena", "kata", "ke", "kecil", "keluar", "kembali", "kemudian", "kepada", "kerap", "kerja", "ketika", "kita", "lagi", "lain", "lalu", "lama", "langsung", "lebih", "lihat", "luar", "makan", "mampu", "mana", "manusia", "masalah", "masih", "masuk", "mata", "mau", "melalui", "melihat", "memang", "membuat", "memiliki", "mencari", "mendapat", "menerima", "mengapa", "mengenai", "menggunakan", "menjadi", "menurut", "mereka", "merupakan", "mungkin", "naik", "nama", "namun", "nanti", "orang", "pada", "paling", "pasti", "penting", "perlu", "pernah", "pikir", "pun", "punya", "saat", "saja", "salah", "sama", "sampai", "sangat", "satu", "saya", "sebab", "sebagai", "sebuah", "sedang", "sedikit", "segala", "segera", "sehingga", "sekali", "sekarang", "sekitar", "selama", "seluruh", "semakin", "semangat", "semua", "sendiri", "seperti", "sering", "serta", "sesuai", "sesuatu", "setelah", "setiap", "siapa", "sudah", "tahu", "tak", "tanpa", "tapi", "telah", "tentang", "tentu", "terus", "tetapi", "tidak", "tiga", "tinggi", "untuk", "waktu", "yang", "buku", "jalan", "malam", "pagi", "siang", "sore", "uang", "rumah", "sekolah", "anak", "ibu", "ayah", "teman", "kasih", "sayang", "cinta", "merah", "biru", "putih", "hitam", "kuning", "hijau", "pintu", "meja", "kursi", "lampu", "kertas", "pena", "gelas", "piring", "nasi", "air", "buah", "sayur", "ikan", "ayam", "sapi", "kuda", "burung", "langit", "laut", "gunung", "hutan", "pohon", "bunga", "daun", "tanah", "batu", "pasir", "panas", "dingin", "cepat", "lambat", "tinggi", "rendah", "panjang", "pendek", "kuat", "lemah", "senang", "sedih", "marah", "takut", "lelah", "lapar", "haus", "tidur", "bangun", "lari", "lompat", "duduk", "berdiri", "bicara", "dengar", "tulis", "baca", "hitung", "gambar", "main", "belajar", "ajar", "bantu", "beli", "jual", "bayar", "ambil", "kasih", "bawa", "taruh", "buka", "tutup", "pilih", "cari", "temu", "kenal", "ingat", "lupa", "paham", "ngerti", "tanya", "jawab", "yakin", "ragu", "percaya", "sehat", "sakit", "obat", "dokter", "guru", "murid", "polisi", "tentara", "petani", "supir", "kantor", "pasar", "toko", "bank", "masjid", "gereja", "kuil", "pura", "negara", "kota", "desa", "pulau", "rakyat", "hukum", "adil", "bebas", "aman", "damai", "maju", "mundur", "kiri", "kanan", "atas", "bawah", "tengah", "ujung", "pangkal", "awal", "akhir", "pagi", "siang", "sore", "malam", "hari", "minggu", "bulan", "tahun", "jam", "menit", "detik"
];

// App State
let words = [];
let currentWordIndex = 0;
let timeLeft = 30;
let timerInterval = null;
let isRunning = false;
let correctWords = 0;
let incorrectWords = 0;
let totalCharsTyped = 0;
let totalCorrectChars = 0;

// DOM Elements
const wordContainer = document.getElementById('wordContainer');
const wordInput = document.getElementById('wordInput');
const timerDisplay = document.getElementById('timerDisplay');
const wpmDisplay = document.getElementById('wpmDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const restartBtn = document.getElementById('restartBtn');
const restartBtnTop = document.getElementById('restartBtnTop');
const timeButtons = document.querySelectorAll('.time-btn');
const resultOverlay = document.getElementById('resultOverlay');
const retryBtn = document.getElementById('retryBtn');

// Results elements
const finalWpm = document.getElementById('finalWpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalCorrect = document.getElementById('finalCorrect');
const finalIncorrect = document.getElementById('finalIncorrect');

/**
 * Initialize the game
 */
function init() {
    setupWordList();
    resetStats();
    
    // Event Listeners
    wordInput.addEventListener('input', handleInput);
    wordInput.addEventListener('keydown', handleKeyDown);
    restartBtn.addEventListener('click', resetGame);
    restartBtnTop.addEventListener('click', resetGame);
    retryBtn.addEventListener('click', resetGame);
    
    timeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;
            timeButtons.forEach(b => b.classList.remove('active', 'bg-emerald-50'));
            btn.classList.add('active', 'bg-emerald-50');
            timeLeft = parseInt(btn.getAttribute('data-time'));
            timerDisplay.innerText = timeLeft;
            resetGame();
        });
    });
}

/**
 * Setup word list from local or API
 */
async function setupWordList() {
    wordContainer.innerHTML = 'Memuat kata...';
    
    // Attempt to fetch from a public source for variety
    try {
        // This is a common public word list on GitHub
        const response = await fetch('https://raw.githubusercontent.com/heruoc/kata-dasar-indonesia/master/kata-dasar.json');
        if (response.ok) {
            const data = await response.json();
            // Flatten if necessary, usually it's an array of strings or objects
            const fetchedWords = Array.isArray(data) ? data : Object.values(data);
            words = fetchedWords.map(w => typeof w === 'string' ? w : w.katadasar).filter(w => w && w.length < 10);
        } else {
            throw new Error('Fetch failed');
        }
    } catch (e) {
        console.warn('Gagal memuat API, menggunakan fallback.', e);
        words = [...INDO_WORDS];
    }
    
    shuffleWords();
    renderWords();
}

function shuffleWords() {
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
}

function renderWords() {
    wordContainer.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.id = 'wordWrapper';
    wrapper.className = 'word-wrapper';
    
    words.slice(0, 150).forEach((word, index) => {
        const span = document.createElement('span');
        span.innerText = word;
        span.className = 'word';
        if (index === 0) span.classList.add('active');
        wrapper.appendChild(span);
    });
    
    wordContainer.appendChild(wrapper);
    currentWordIndex = 0;
}

/**
 * Game Logic
 */
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    
    const startTime = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        
        // Update stats every second
        updateStats(startTime - timeLeft);
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function handleInput(e) {
    if (!isRunning && wordInput.value.length > 0) {
        startTimer();
    }
    
    const currentWord = words[currentWordIndex];
    const typedValue = wordInput.value.trim();
    const wordElements = wordContainer.querySelectorAll('.word');
    const currentElement = wordElements[currentWordIndex];
    
    // Visual feedback for current word while typing
    if (currentWord.startsWith(typedValue)) {
        currentElement.className = 'word active';
    } else {
        currentElement.className = 'word active bg-red-100';
    }
}

function handleKeyDown(e) {
    if (e.key === ' ') {
        e.preventDefault();
        const typedValue = wordInput.value.trim();
        if (typedValue === '') return;
        
        validateWord(typedValue);
        wordInput.value = '';
        moveToNextWord();
    }
}

function validateWord(typedValue) {
    const currentWord = words[currentWordIndex];
    const wordElements = wordContainer.querySelectorAll('.word');
    const currentElement = wordElements[currentWordIndex];
    
    totalCharsTyped += typedValue.length + 1; // +1 for space
    
    if (typedValue === currentWord) {
        correctWords++;
        totalCorrectChars += currentWord.length + 1;
        currentElement.className = 'word correct';
    } else {
        incorrectWords++;
        currentElement.className = 'word incorrect';
    }
}

function moveToNextWord() {
    currentWordIndex++;
    const wordElements = wordContainer.querySelectorAll('.word');
    const wrapper = document.getElementById('wordWrapper');
    
    if (currentWordIndex >= wordElements.length) {
        renderWords();
        return;
    }
    
    const prevElement = wordElements[currentWordIndex - 1];
    const nextElement = wordElements[currentWordIndex];
    nextElement.classList.add('active');
    
    // Line shifting logic
    const currentTop = prevElement.offsetTop;
    const nextTop = nextElement.offsetTop;
    
    // If we moved to a new line
    if (nextTop > currentTop) {
        const lineHeight = 48; // 3rem = 48px
        // Shift up if we are past the first line
        if (nextTop >= lineHeight) {
            const currentShift = parseInt(wrapper.style.transform.replace('translateY(', '').replace('px)', '') || 0);
            wrapper.style.transform = `translateY(${currentShift - lineHeight}px)`;
        }
    }
}

function updateStats(timeElapsed) {
    if (timeElapsed <= 0) return;
    
    const minutes = timeElapsed / 60;
    
    // WPM: Standard calculation (Correct Chars / 5) / minutes
    const wpm = Math.round((totalCorrectChars / 5) / minutes);
    
    // Accuracy based on words
    const totalAttempted = correctWords + incorrectWords;
    const accuracy = totalAttempted === 0 ? 0 : Math.round((correctWords / totalAttempted) * 100);
    
    wpmDisplay.innerText = wpm;
    accuracyDisplay.innerText = accuracy + '%';
}

function endGame() {
    clearInterval(timerInterval);
    isRunning = false;
    wordInput.disabled = true;
    
    // Final calculations
    const activeTime = parseInt(document.querySelector('.time-btn.active').getAttribute('data-time'));
    const finalWpmValue = Math.round((totalCorrectChars / 5) / (activeTime / 60));
    const totalAttempted = correctWords + incorrectWords;
    const finalAccValue = totalAttempted === 0 ? 0 : Math.round((correctWords / totalAttempted) * 100);
    
    // Set results
    finalWpm.innerText = finalWpmValue;
    finalAccuracy.innerText = finalAccValue + '%';
    finalCorrect.innerText = correctWords;
    finalIncorrect.innerText = incorrectWords;
    
    // Show overlay
    resultOverlay.classList.remove('hidden');
}

function resetGame() {
    clearInterval(timerInterval);
    isRunning = false;
    
    const activeTimeBtn = document.querySelector('.time-btn.active');
    timeLeft = activeTimeBtn ? parseInt(activeTimeBtn.getAttribute('data-time')) : 30;
    
    resetStats();
    wordInput.value = '';
    wordInput.disabled = false;
    wordInput.focus();
    timerDisplay.innerText = timeLeft;
    
    resultOverlay.classList.add('hidden');
    shuffleWords();
    renderWords();
}

function resetStats() {
    correctWords = 0;
    incorrectWords = 0;
    totalCharsTyped = 0;
    totalCorrectChars = 0;
    wpmDisplay.innerText = '0';
    accuracyDisplay.innerText = '0%';
}

// Start
init();
