// js/main.js

// 1. Sanity check
console.log('CGDC rebrand ready 🚀');

// 2. Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', e => {
  e.stopPropagation();
  menu.classList.toggle('open');
});

// Close menu when clicking outside
document.addEventListener('click', () => {
  if (menu.classList.contains('open')) {
    menu.classList.remove('open');
  }
});

// 3. Fade in hero overlay on load
window.addEventListener('load', () => {
  const overlay = document.querySelector('.hero-overlay');
  if (!overlay) return;

  // Start hidden
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 1s ease-in-out';

  // Trigger the transition
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
});
