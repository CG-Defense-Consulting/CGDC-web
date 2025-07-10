// js/main.js

console.log('CGDC rebrand ready 🚀');

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', e => {
  e.stopPropagation();
  menu.classList.toggle('open');
});

// Close menu when clicking anywhere else
document.addEventListener('click', () => {
  if (menu.classList.contains('open')) {
    menu.classList.remove('open');
  }
});

// Fade in hero overlay on load
window.addEventListener('load', () => {
  const overlay = document.querySelector('.hero-overlay');
  overlay.style.opacity = 0;
  overlay.style.transition = 'opacity 1s ease-in-out';
  // trigger reflow then fade in
  requestAnimationFrame(() => {
    overlay.style.opacity = 1;
  });
});
