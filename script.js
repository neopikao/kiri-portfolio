'use strict';

// ===== ナビゲーション =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== スムーズスクロール =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ===== フェードインアニメーション =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.achievement-card, .voice-card, .profile-grid, .contact-body').forEach((el, i) => {
  el.classList.add('fade-in');
  if (i % 3 === 1) el.classList.add('fade-in-delay-1');
  if (i % 3 === 2) el.classList.add('fade-in-delay-2');
  observer.observe(el);
});

// ===== パーティクル =====
const particleContainer = document.getElementById('particles');
const PARTICLE_COUNT = 20;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
  p.style.setProperty('--delay', `${Math.random() * 8}s`);
  p.style.left = `${Math.random() * 100}%`;
  p.style.width = p.style.height = `${1 + Math.random() * 3}px`;
  particleContainer.appendChild(p);
}

// ===== オーディオプレイヤー =====
let currentAudio = null;
let currentBtn = null;

document.querySelectorAll('.play-btn').forEach(btn => {
  const audioId = btn.dataset.audio;
  const audio = document.getElementById(audioId);
  if (!audio) return;

  btn.addEventListener('click', () => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (currentBtn) {
        currentBtn.classList.remove('playing');
        currentBtn.querySelector('.play-icon').textContent = '▶';
      }
    }

    if (audio.paused) {
      audio.play().then(() => {
        btn.classList.add('playing');
        btn.querySelector('.play-icon').textContent = '⏸';
        currentAudio = audio;
        currentBtn = btn;
      }).catch(() => {
        // 音声ファイルが未配置の場合は無視
      });
    } else {
      audio.pause();
      btn.classList.remove('playing');
      btn.querySelector('.play-icon').textContent = '▶';
      currentAudio = null;
      currentBtn = null;
    }
  });

  audio.addEventListener('ended', () => {
    btn.classList.remove('playing');
    btn.querySelector('.play-icon').textContent = '▶';
    currentAudio = null;
    currentBtn = null;
  });
});
