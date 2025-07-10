// js/main.js

// 1) Sanity check
console.log('CGDC rebrand ready 🚀');

// 2) Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const menu      = document.querySelector('.menu');

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

// 3) Fade-in hero overlay as soon as the DOM is parsed
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.hero-overlay');
  if (!overlay) return;
  // Trigger the CSS transition from opacity:0 → opacity:1
  overlay.style.opacity = '1';
});
