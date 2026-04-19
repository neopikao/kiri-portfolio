'use strict';

// ===== ナビゲーション =====
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');
const sections  = Array.from(document.querySelectorAll('section[id]'));

// スクロール追従ヘッダー・パララックス・アクティブリンク
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onResize, { passive: true });

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 60);
  highlightNav(y);
  if (window.innerWidth > 768) parallax(y);
}

// ハンバーガーメニュー開閉
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMenu);
});
function closeMenu() {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// アクティブリンク
function highlightNav(y) {
  const mid = y + window.innerHeight * 0.35;
  sections.forEach(sec => {
    const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle('active',
      mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight
    );
  });
}

// ===== スムーズスクロール =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 70;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
  });
});

// ===== パララックス（PC のみ） =====
const heroChar = document.getElementById('heroChar');
const heroEl   = document.getElementById('hero');

function parallax(scrollY) {
  if (!heroChar || !heroEl) return;
  if (scrollY >= heroEl.offsetHeight) return;
  // translateX(-50%) で中央配置を維持しながら縦方向にパララックス
  heroChar.style.transform = `translateX(-50%) translateY(${scrollY * 0.28}px)`;
}

// リサイズ時：スマホへ切り替わったらインライン transform をクリア
function onResize() {
  if (window.innerWidth <= 768 && heroChar) {
    heroChar.style.transform = '';
  }
}

// ===== フェードインアニメーション =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== パーティクル生成 =====
const particleRoot = document.getElementById('particles');
if (particleRoot) {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 1.5 + Math.random() * 3;
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${size}px`,
      `--dur:${7 + Math.random() * 9}s`,
      `--del:${Math.random() * 10}s`,
    ].join(';');
    particleRoot.appendChild(p);
  }
}

// ===== オーディオプレイヤー =====
let activeAudio = null;
let activeBtn   = null;

document.querySelectorAll('.vc-btn').forEach(btn => {
  const audio    = document.getElementById(btn.dataset.aid);
  const icoPlay  = btn.querySelector('.ico-play');
  const icoPause = btn.querySelector('.ico-pause');
  if (!audio) return;

  btn.addEventListener('click', () => {
    // 別の音声が再生中なら停止
    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      if (activeBtn) resetBtn(activeBtn);
    }

    if (audio.paused) {
      audio.play()
        .then(() => {
          icoPlay.style.display  = 'none';
          icoPause.style.display = '';
          activeAudio = audio;
          activeBtn   = btn;
        })
        .catch(() => {}); // ファイル未配置時は無視
    } else {
      audio.pause();
      resetBtn(btn);
      activeAudio = null;
      activeBtn   = null;
    }
  });

  audio.addEventListener('ended', () => {
    resetBtn(btn);
    activeAudio = null;
    activeBtn   = null;
  });

  function resetBtn(b) {
    b.querySelector('.ico-play').style.display  = '';
    b.querySelector('.ico-pause').style.display = 'none';
  }
});

// 初期アクティブリンクをセット
highlightNav(window.scrollY);
