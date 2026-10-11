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
// Logika Geser Kartu Tetangga (Khusus Pengurus di Struktur Organisasi)
// ==========================================
function setupCardNeighborShifting() {
    const wrappers = document.querySelectorAll('.team-hierarchy .chairman-wrapper');

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

            // Reset kartu lain di seluruh pengurus agar fokus ke kartu yang baru diklik
            document.querySelectorAll('.team-hierarchy .chairman-wrapper').forEach(other => {
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

    // Reset posisi kartu jika kursor mouse keluar dari area level pengurus
    document.querySelectorAll('.team-hierarchy .team-level').forEach(container => {
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

    // Reset kartu aktif jika klik di area kosong di luar kartu pengurus
    if (!document.body.dataset.outsideClickInit) {
        document.body.dataset.outsideClickInit = 'true';
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chairman-wrapper')) {
                document.querySelectorAll('.team-hierarchy .chairman-wrapper').forEach(card => {
                    card.classList.remove('active', 'shift-left', 'shift-right');
                });
            }
        });
    }
}

// ==========================================
// 3D Coverflow Carousel (Infinite Loop / Muter)
// Tampilan Satu per Satu Kartu Anggota (Seperti Contoh Nitro Showcase)
// ==========================================
function initCoverflowCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stage = container.querySelector('.carousel-stage');
    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll('.chairman-wrapper'));
    const total = cards.length;
    if (total === 0) return;

    let currentIndex = parseInt(container.dataset.currentIndex || '0', 10);
    if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= total) {
        currentIndex = 0;
    }
    container.dataset.currentIndex = currentIndex;

    // Pastikan ID dan inisialisasi emoji ada untuk setiap kartu
    cards.forEach((card, index) => {
        if (!card.id) {
            card.id = `${containerId}-card-${index}`;
        }
        initEmojiWrapper(card.id);
    });

    // Inisialisasi Dots
    const dotsContainer = container.querySelector('.carousel-dots');
    if (dotsContainer && !dotsContainer.dataset.initDots) {
        dotsContainer.dataset.initDots = 'true';
        dotsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('aria-label', `Lihat anggota ke-${i + 1}`);
            dot.addEventListener('click', () => {
                goToIndex(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    function render() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

        const stepX = isMobile ? 150 : (isTablet ? 195 : 240);
        const step2X = isMobile ? 245 : (isTablet ? 340 : 425);
        const step3X = isMobile ? 320 : (isTablet ? 470 : 590);

        cards.forEach((card, i) => {
            let diff = i - currentIndex;
            // Jalur melingkar terpendek (infinite loop modulo)
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            card.classList.remove('active', 'is-center', 'is-neighbor');

            if (diff === 0) {
                // Kartu Tengah (Utama / Spotlight)
                card.classList.add('active', 'is-center');
                card.style.transform = 'translate(-50%, -50%) scale(1.05) translateZ(60px)';
                card.style.opacity = '1';
                card.style.zIndex = '15';
                card.style.filter = 'none';
                card.style.pointerEvents = 'auto';
                card.style.visibility = 'visible';
            } else if (Math.abs(diff) === 1) {
                // Kartu Tetangga Sebelah Kiri / Kanan
                card.classList.add('is-neighbor');
                const sign = diff > 0 ? 1 : -1;
                const x = sign * stepX;
                const rotateY = sign * (isMobile ? -14 : -20);
                const scale = isMobile ? 0.78 : 0.85;
                card.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale}) rotateY(${rotateY}deg)`;
                card.style.opacity = isMobile ? '0.55' : '0.68';
                card.style.zIndex = '10';
                card.style.filter = 'brightness(0.85)';
                card.style.pointerEvents = 'auto';
                card.style.visibility = 'visible';
            } else if (Math.abs(diff) === 2) {
                // Kartu Sebelah Tingkat 2
                const sign = diff > 0 ? 1 : -1;
                const x = sign * step2X;
                const rotateY = sign * (isMobile ? -22 : -28);
                const scale = isMobile ? 0.62 : 0.72;
                card.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale}) rotateY(${rotateY}deg)`;
                card.style.opacity = isMobile ? '0.2' : '0.4';
                card.style.zIndex = '5';
                card.style.filter = 'brightness(0.65)';
                card.style.pointerEvents = isMobile ? 'none' : 'auto';
                card.style.visibility = 'visible';
            } else if (Math.abs(diff) === 3 && !isMobile) {
                // Kartu Sebelah Tingkat 3 (Desktop/Layar Lebar)
                const sign = diff > 0 ? 1 : -1;
                const x = sign * step3X;
                const rotateY = sign * -32;
                const scale = 0.58;
                card.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale}) rotateY(${rotateY}deg)`;
                card.style.opacity = '0.12';
                card.style.zIndex = '2';
                card.style.filter = 'brightness(0.5)';
                card.style.pointerEvents = 'auto';
                card.style.visibility = 'visible';
            } else {
                // Kartu di Belakang (Sembunyi)
                const sign = diff > 0 ? 1 : -1;
                card.style.transform = `translate(calc(-50% + ${sign * step3X}px), -50%) scale(0.4)`;
                card.style.opacity = '0';
                card.style.zIndex = '0';
                card.style.pointerEvents = 'none';
                card.style.visibility = 'hidden';
            }
        });

        // Update counter teks (misal: 1 / 13)
        const counter = container.querySelector('.carousel-counter');
        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${total}`;
        }

        // Update dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    function goToIndex(index) {
        currentIndex = ((index % total) + total) % total;
        container.dataset.currentIndex = currentIndex;
        render();
    }

    function next() {
        goToIndex(currentIndex + 1);
    }

    function prev() {
        goToIndex(currentIndex - 1);
    }

    // Pasang Event Tombol & Interaksi hanya sekali
    if (!container.dataset.carouselEventsInit) {
        container.dataset.carouselEventsInit = 'true';

        const prevBtn = container.querySelector('.carousel-nav-btn.prev');
        const nextBtn = container.querySelector('.carousel-nav-btn.next');
        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);

        // Navigasi Keyboard (Panah Kiri & Kanan) saat kursor di area karusel
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prev();
            } else if (e.key === 'ArrowRight') {
                next();
            }
        });

        // Sentuhan Geser (Touch Swipe) dengan pencegahan ghost click
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouching = false;
        let hasSwiped = false;

        stage.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouching = true;
            hasSwiped = false;
        }, { passive: true });

        stage.addEventListener('touchmove', (e) => {
            if (!isTouching) return;
            const diffX = e.touches[0].clientX - touchStartX;
            const diffY = e.touches[0].clientY - touchStartY;
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 12) {
                hasSwiped = true;
            }
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
            if (!isTouching) return;
            isTouching = false;
            const endX = e.changedTouches[0].clientX;
            const diffX = endX - touchStartX;
            if (Math.abs(diffX) > 38) {
                if (diffX < 0) {
                    next();
                } else {
                    prev();
                }
            }
            setTimeout(() => {
                hasSwiped = false;
            }, 60);
        });

        // Mouse Drag untuk Desktop dengan pencegahan ghost click
        let dragStartX = 0;
        let isDragging = false;
        let hasDragged = false;

        stage.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('a') || e.target.closest('.member-socials')) return;
            dragStartX = e.clientX;
            isDragging = true;
            hasDragged = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            if (Math.abs(e.clientX - dragStartX) > 10) {
                hasDragged = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const diffX = e.clientX - dragStartX;
            if (Math.abs(diffX) > 40) {
                if (diffX < 0) {
                    next();
                } else {
                    prev();
                }
            }
            setTimeout(() => {
                hasDragged = false;
            }, 60);
        });

        // Klik kartu sebelah untuk geser ke tengah
        cards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                if (hasDragged || hasSwiped) return;
                if (e.target.closest('a') || e.target.closest('.member-socials')) return;
                const current = parseInt(container.dataset.currentIndex || '0', 10);
                if (i !== current) {
                    goToIndex(i);
                }
            });
        });

        window.addEventListener('resize', () => {
            render();
        });
    }

    render();
}

// Inisialisasi otomatis untuk kartu pengurus & karusel anggota saat awal dimuat
document.querySelectorAll('.team-hierarchy .chairman-wrapper').forEach((wrapper, index) => {
    if (!wrapper.id) {
        wrapper.id = 'emoji-wrapper-' + index;
    }
    initEmojiWrapper(wrapper.id);
});
setupCardNeighborShifting();

// Siapkan karusel anggota sejak awal
initCoverflowCarousel('carousel-laki');
initCoverflowCarousel('carousel-perempuan');

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

        // Inisialisasi ulang coverflow carousels saat wadah anggota ditampilkan
        setTimeout(() => {
            initCoverflowCarousel('carousel-laki');
            initCoverflowCarousel('carousel-perempuan');
        }, 50);
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
