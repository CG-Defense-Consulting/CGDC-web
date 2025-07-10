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

// Fade in hero overlay once all assets have loaded
window.addEventListener('load', () => {
  const overlay = document.querySelector('.hero-overlay');
  if (overlay) {
    overlay.classList.add('visible');
  }
});

// Strategic Focus Areas Carousel
(function() {
  const slides = document.querySelectorAll('.focus-slide');
  const dots   = document.querySelectorAll('.focus-dot');
  const prev   = document.querySelector('.focus-prev');
  const next   = document.querySelector('.focus-next');
  let current  = 0, max = slides.length;

  function showSlide(idx) {
    slides.forEach((s,i)=> s.classList.toggle('active', i===idx));
    dots.forEach((d,i)=> d.classList.toggle('active', i===idx));
    current = idx;
  }

  prev.addEventListener('click', () => showSlide((current-1+max)%max));
  next.addEventListener('click', () => showSlide((current+1)%max));
  dots.forEach(dot => dot.addEventListener('click', e => {
    showSlide(parseInt(e.target.dataset.index));
  }));

  setInterval(() => showSlide((current+1)%max), 8000);
})();
