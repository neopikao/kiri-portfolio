/* ===========================================
   倖狼キリ Portfolio - script
   - Loader
   - Custom cursor
   - IntersectionObserver reveal
   - Hero parallax (mouse + scroll)
   - Voice play toggle
   - Smooth scroll
=========================================== */

(() => {
  // ----- Loader -----
  const loader = document.getElementById('loader');
  const pct = document.getElementById('loaderPct');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18 + 4);
    if (pct) pct.textContent = `LOADING — ${String(Math.floor(p)).padStart(2,'0')}`;
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => loader && loader.classList.add('is-hidden'), 320);
    }
  }, 140);

  // wait for window load (image included) -> finish loader fast
  window.addEventListener('load', () => {
    p = 100;
    if (pct) pct.textContent = 'LOADING — 100';
    setTimeout(() => loader && loader.classList.add('is-hidden'), 280);
  });

  // ----- Custom cursor (desktop) -----
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer && dot && ring) {
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    // hover state
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  } else {
    // hide cursor on touch devices
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  // ----- Reveal on scroll -----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        // animate range fills if any
        e.target.querySelectorAll('.range-fill').forEach(rf => {
          const w = rf.getAttribute('data-w');
          requestAnimationFrame(() => rf.style.width = w + '%');
        });
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  // observe range groups too
  document.querySelectorAll('.voice-meter-grid, #skills').forEach(el => io.observe(el));

  // ----- Hero parallax -----
  const heroChar = document.getElementById('heroChar');
  const heroKanji = document.querySelector('.hero-kanji');
  const heroRing  = document.querySelector('.hero-ring');
  if (heroChar) {
    let tx = 0, ty = 0;
    let cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;   // -0.5 .. 0.5
      const y = (e.clientY / window.innerHeight) - 0.5;
      tx = x * -16;
      ty = y * -10;
      if (heroKanji) heroKanji.style.transform = `translate(${x*30}px, ${y*20}px)`;
      if (heroRing)  heroRing.style.transform  = `translate(${-50 + x*4}%, ${-50 + y*4}%) rotate(${x*4}deg)`;
    });
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      // combine with scroll-based shift
      const sy = window.scrollY;
      const scrollOffset = Math.min(sy * 0.12, 80);
      heroChar.style.transform = `translate(${cx}px, ${cy + scrollOffset * 0.4}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // ----- Smooth scroll for anchors -----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
    });
  });

  // ----- Voice play toggle -----
  const PLAY_ICON  = '<path d="M8 5v14l11-7z"/>';
  const PAUSE_ICON = '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
  const audios = new Map();

  const setPlayIcon = (card, playing) => {
    const svg = card.querySelector('.voice-play svg');
    if (svg) svg.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
  };

  const fmtTime = (s) => {
    if (!isFinite(s)) return '';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  document.querySelectorAll('.voice-card').forEach(card => {
    const btn = card.querySelector('.voice-play');
    const src = card.getAttribute('data-src');
    const timeEl = card.querySelector('.voice-time');
    if (!btn) return;

    let audioEl = null;
    if (src) {
      audioEl = document.createElement('audio');
      audioEl.src = src;
      audioEl.preload = 'metadata';
      audioEl.style.display = 'none';
      card.appendChild(audioEl);
      audios.set(card, audioEl);

      audioEl.addEventListener('loadedmetadata', () => {
        if (timeEl) timeEl.textContent = fmtTime(audioEl.duration);
      });
      audioEl.addEventListener('ended', () => {
        card.classList.remove('is-playing');
        setPlayIcon(card, false);
      });
      audioEl.addEventListener('error', (e) => {
        console.error('audio error', src, audioEl.error);
      });
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const a = audios.get(card);

      // pause others
      audios.forEach((other, otherCard) => {
        if (otherCard !== card && !other.paused) {
          other.pause();
          other.currentTime = 0;
          otherCard.classList.remove('is-playing');
          setPlayIcon(otherCard, false);
        }
      });

      if (!a) {
        const playing = card.classList.toggle('is-playing');
        setPlayIcon(card, playing);
        return;
      }

      if (a.paused) {
        const pr = a.play();
        if (pr && pr.then) {
          pr.then(() => {
            card.classList.add('is-playing');
            setPlayIcon(card, true);
          }).catch((err) => {
            console.warn('play blocked', err);
          });
        } else {
          card.classList.add('is-playing');
          setPlayIcon(card, true);
        }
      } else {
        a.pause();
        a.currentTime = 0;
        card.classList.remove('is-playing');
        setPlayIcon(card, false);
      }
    });
  });

  // ----- YouTube modal -----
  const ytModal = document.getElementById('ytModal');
  const ytFrame = document.getElementById('ytFrame');
  const ytRows = document.querySelectorAll('[data-yt]');

  const openYt = (id) => {
    if (!ytModal || !ytFrame) return;
    ytFrame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    const ext = document.getElementById('ytExternal');
    if (ext) ext.href = `https://youtu.be/${id}`;
    ytModal.classList.add('is-open');
    ytModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeYt = () => {
    if (!ytModal || !ytFrame) return;
    ytModal.classList.remove('is-open');
    ytModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // stop video
    setTimeout(() => { ytFrame.src = ''; }, 400);
  };

  ytRows.forEach(row => {
    row.addEventListener('click', (e) => {
      const id = row.getAttribute('data-yt');
      if (!id) return;
      e.preventDefault();
      openYt(id);
    });
  });
  if (ytModal) {
    ytModal.querySelectorAll('[data-yt-close]').forEach(el => {
      el.addEventListener('click', closeYt);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && ytModal.classList.contains('is-open')) closeYt();
    });
  }

  // ----- Nav background subtle on scroll (already mix-blend) -----
  // No extra needed.

})();
