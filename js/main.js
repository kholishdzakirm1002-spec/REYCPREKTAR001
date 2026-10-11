// Initialize AOS Animation
document.addEventListener("DOMContentLoaded", function() {
    AOS.init({
        once: true,
        offset: 100,
        duration: 800,
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle 
const mobileBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
const menuIcon = document.getElementById('menu-icon');

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        const isOpen = navLinks.classList.contains('active');
        if (menuIcon) {
            menuIcon.className = isOpen ? 'ph-bold ph-x' : 'ph-bold ph-list';
        }
    });

    // Tutup menu saat link diklik
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (menuIcon) menuIcon.className = 'ph-bold ph-list';
        });
    });

    // Tutup menu saat klik di luar
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            if (menuIcon) menuIcon.className = 'ph-bold ph-list';
        }
    });
}

/// Generic emoji wrapper: emoji muncul mengintip dari belakang card tanpa terpotong
function initEmojiWrapper(id) {
    const wrapper = document.getElementById(id);
    if (!wrapper) return;

    const emojis = Array.from(wrapper.querySelectorAll('.floating-emoji'));
    if (emojis.length === 0) return;

    // Deteksi ukuran layar
    const isMobile = window.innerWidth <= 768;

    // Hitung setengah lebar kartu (halfWidth) secara dinamis agar pas untuk semua ukuran kartu
    const card = wrapper.querySelector('.team-card');
    let halfWidth = 0;
    if (card && card.offsetWidth > 0) {
        halfWidth = card.offsetWidth / 2;
    } else {
        if (wrapper.closest('#daftar-anggota') || wrapper.closest('.members-grid')) {
            halfWidth = isMobile ? 110 : 120;
        } else if (card && card.classList.contains('chairman')) {
            halfWidth = isMobile ? 140 : 150;
        } else {
            halfWidth = isMobile ? 120 : 130;
        }
    }

    // Jarak aman keluar dari tepi kartu agar SELURUH emoji terlihat utuh (tidak kepotong tepi kartu)
    // Radius emoji ~16-18px, kita beri jarak 36px (HP) / 48px (PC) dari tepian kartu
    const extraOut = isMobile ? 36 : 48;
    const baseX = halfWidth + extraOut;
    const baseY = isMobile ? 85 : 95;

    // Slot posisi aman di sekeliling foto: [pengali X, pengali Y]
    const slots = [
        [-1.0, -0.85],  // 1. Kiri Atas (dekat bahu/kepala kiri)
        [-1.04, -0.15], // 2. Kiri Tengah (samping foto kiri)
        [-1.0, 0.55],   // 3. Kiri Bawah (bawah foto kiri)
        [1.0, -0.85],   // 4. Kanan Atas (dekat bahu/kepala kanan)
        [1.04, -0.15],  // 5. Kanan Tengah (samping foto kanan)
        [1.0, 0.55]     // 6. Kanan Bawah (bawah foto kanan)
    ];

    // Acak urutan slot agar posisinya dinamis dan natural
    slots.sort(() => Math.random() - 0.5);

    emojis.forEach((emoji, index) => {
        const slot = slots[index % slots.length];

        // Jitter halus (+/- 4px X, +/- 10px Y) agar posisi natural tapi tetap aman keluar kartu
        const jitterX = (Math.random() - 0.5) * 8;
        const jitterY = (Math.random() - 0.5) * 20;

        // Hitung posisi akhir TX dan TY
        const tx = (slot[0] * baseX) + jitterX;
        const ty = (slot[1] * baseY) + jitterY;

        emoji.style.setProperty('--tx', tx + 'px');
        emoji.style.setProperty('--ty', ty + 'px');

        // Ukuran proporsional agar tampil tajam dan estetik
        const baseSize = isMobile ? 1.5 : 2.0;
        const randSize = isMobile ? 0.3 : 0.4;

        emoji.style.fontSize = (Math.random() * randSize + baseSize) + 'rem';

        const inner = emoji.querySelector('.emoji-inner');
        if (inner) inner.style.animationDelay = (Math.random() * 2) + 's';
    });
}

// ==========================================
// Logika Geser Kartu Tetangga (Neighbor Shift)
// Saat emoji muncul, kartu sebelah otomatis bergeser memberi ruang
// ==========================================
function setupCardNeighborShifting() {
    const wrappers = document.querySelectorAll('.chairman-wrapper');

    // Fungsi pembantu untuk menggeser kartu tetangga
    function updateShifts(parent, activeOrHoveredWrapper) {
        if (!parent) return;
        const siblings = Array.from(parent.children).filter(el => el.classList.contains('chairman-wrapper'));
        if (!activeOrHoveredWrapper) {
            siblings.forEach(s => s.classList.remove('shift-left', 'shift-right'));
            return;
        }
        const currentIndex = siblings.indexOf(activeOrHoveredWrapper);
        if (currentIndex === -1) return;

        siblings.forEach((sibling, i) => {
            if (i < currentIndex) {
                sibling.classList.add('shift-left');
                sibling.classList.remove('shift-right');
            } else if (i > currentIndex) {
                sibling.classList.add('shift-right');
                sibling.classList.remove('shift-left');
            } else {
                sibling.classList.remove('shift-left', 'shift-right');
            }
        });
    }

    wrappers.forEach(wrapper => {
        if (wrapper.dataset.shiftInitialized) return;
        wrapper.dataset.shiftInitialized = 'true';

        // 1. Mouse Masuk (Hover): geser kartu sebelah kiri ke kiri, kartu kanan ke kanan
        wrapper.addEventListener('mouseenter', () => {
            const parent = wrapper.parentElement;
            if (!parent) return;
            updateShifts(parent, wrapper);
        });

        // 2. Mouse Keluar: jika ada kartu yang sedang aktif (diklik), pertahankan posisi geser kartu aktif
        wrapper.addEventListener('mouseleave', () => {
            const parent = wrapper.parentElement;
            if (!parent) return;

            const activeCard = parent.querySelector('.chairman-wrapper.active');
            if (activeCard) {
                updateShifts(parent, activeCard);
            } else {
                updateShifts(parent, null);
            }
        });

        // 3. Klik/Sentuh (untuk Desktop & Layar Sentuh Smartphone/Tablet)
        wrapper.addEventListener('click', (e) => {
            // Jika user mengklik link sosial media, jangan ubah status aktif kartu
            if (e.target.closest('.member-socials') || e.target.closest('a')) return;

            const parent = wrapper.parentElement;
            if (!parent) return;

            const wasActive = wrapper.classList.contains('active');

            // Reset kartu lain di seluruh halaman agar fokus ke kartu yang baru diklik
            document.querySelectorAll('.chairman-wrapper').forEach(other => {
                if (other !== wrapper) {
                    other.classList.remove('active', 'shift-left', 'shift-right');
                }
            });

            if (wasActive) {
                wrapper.classList.remove('active');
                updateShifts(parent, null);
            } else {
                wrapper.classList.add('active');
                updateShifts(parent, wrapper);
            }
        });
    });

    // Reset posisi kartu jika kursor mouse keluar dari area grid/level (kecuali jika ada kartu aktif)
    document.querySelectorAll('.members-grid, .team-level').forEach(container => {
        if (!container.dataset.containerLeaveInit) {
            container.dataset.containerLeaveInit = 'true';
            container.addEventListener('mouseleave', () => {
                const activeCard = container.querySelector('.chairman-wrapper.active');
                if (activeCard) {
                    updateShifts(container, activeCard);
                } else {
                    updateShifts(container, null);
                }
            });
        }
    });

    // Reset kartu aktif jika klik di area kosong di luar kartu
    if (!document.body.dataset.outsideClickInit) {
        document.body.dataset.outsideClickInit = 'true';
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chairman-wrapper')) {
                document.querySelectorAll('.chairman-wrapper').forEach(card => {
                    card.classList.remove('active', 'shift-left', 'shift-right');
                });
            }
        });
    }
}

// Inisialisasi otomatis untuk SEMUA kartu pengurus
document.querySelectorAll('.chairman-wrapper').forEach((wrapper, index) => {
    if (!wrapper.id) {
        wrapper.id = 'emoji-wrapper-' + index;
    }
    initEmojiWrapper(wrapper.id);
});
setupCardNeighborShifting();
// Modal Logic untuk Detail Program
// ==========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Kunci scroll halaman belakang
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Buka kunci scroll halaman belakang
        document.body.style.overflow = 'auto';
    }
}

// Tutup modal jika user mengklik area gelap di luar kotak putih
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// ==========================================
// Auto-Slider Gambar Modal Olahraga (Smooth & Preload)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('olahraga-slider');
    if (slider) {
        let currentImg = 1;
        const totalImgs = 20; // Total gambar

        setInterval(() => {
            // Tentukan nomor gambar selanjutnya
            let nextImg = currentImg + 1;
            if (nextImg > totalImgs) nextImg = 1;

            // PRELOAD: Muat gambar selanjutnya di belakang layar terlebih dahulu
            const imgPreload = new Image();
            imgPreload.src = `stroge/olahraga/${nextImg}.jpeg`;

            // Hanya lakukan transisi JIKA gambar selanjutnya sudah siap dimuat
            imgPreload.onload = () => {
                // Fade out (Hilangkan gambar perlahan)
                slider.style.opacity = '0';

                setTimeout(() => {
                    // Ganti foto saat layarnya sedang transparan (0 opacity)
                    slider.src = imgPreload.src;
                    currentImg = nextImg;

                    // Fade in (Munculkan kembali perlahan)
                    slider.style.opacity = '1';
                }, 500); // 500ms mengikuti durasi transisi di CSS (0.5s)
            };
        }, 3500); // Berganti setiap 3,5 detik
    }
});

// ==========================================
// Modal Logic untuk Detail Program (Auto Play/Reset Video)
// ==========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Kunci scroll halaman belakang
        document.body.style.overflow = 'hidden';

        // Cari video di dalam modal ini dan putar
        const video = modal.querySelector('video');
        if (video) {
            video.play();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Buka kunci scroll halaman belakang
        document.body.style.overflow = 'auto';

        // Cari video di dalam modal ini, hentikan, dan reset ke awal
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0; // Reset ke detik 0
        }
    }
}

// Tutup modal jika user mengklik area gelap di luar kotak putih
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = 'auto';

            // Cari video di dalam modal ini, hentikan, dan reset ke awal
            const video = this.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0; // Reset ke detik 0
            }
        }
    });
});

// ==========================================
// Toggle Daftar Anggota (Buka/Tutup)
// ==========================================
function toggleMembers() {
    const memberSection = document.getElementById('daftar-anggota');
    const btn = document.getElementById('btn-toggle-anggota');

    if (memberSection.style.display === 'none') {
        memberSection.style.display = 'block';
        btn.innerHTML = '<i class="ph-bold ph-caret-up"></i> Sembunyikan Anggota';

        // Panggil ulang inisialisasi emoji dan pergeseran kartu saat anggota ditampilkan
        document.querySelectorAll('#daftar-anggota .chairman-wrapper').forEach((wrapper, index) => {
            if (!wrapper.id) wrapper.id = 'member-emoji-' + index;
            initEmojiWrapper(wrapper.id);
        });
        setupCardNeighborShifting();
    } else {
        memberSection.style.display = 'none';
        btn.innerHTML = '<i class="ph-fill ph-users-three"></i> Lihat Anggota Lainnya';
    }
}

// ==========================================
// Tutup CTA Banner (Siap Berkontribusi)
// ==========================================
function closeCTA() {
    const cta = document.getElementById('cta-banner');
    if (cta) {
        // Menyembunyikan banner saat tombol X ditekan
        cta.style.display = 'none';
    }
}