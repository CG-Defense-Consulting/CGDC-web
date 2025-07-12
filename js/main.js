// HAMBURGER MENU TOGGLE
document.querySelector('.hamburger').addEventListener('click', function () {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('open');
});

// SCROLL TO SECTION LINKS
document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });

    // Close mobile menu if open
    document.querySelector('.menu').classList.remove('open');
  });
});

// STRATEGIC FOCUS AREA ROTATION
const focusImages = [
  'images/focus1.jpg',
  'images/focus2.jpg',
  'images/focus3.jpg',
  'images/focus4.jpg',
  'images/focus5.jpg',
  'images/focus6.jpg'
];

const focusTitles = [
  'Defense Manufacturing',
  'Supply Chain',
  'AI & Data',
  'Contract Management',
  'Logistics',
  'Compliance'
];

const focusDescriptions = [
  'End-to-end support for defense contractors, from sourcing to assembly oversight.',
  'Ensure continuity with deep-tier visibility, supplier validation, and risk mitigation.',
  'AI-powered analytics for predictive insights and operational intelligence.',
  'Automated document generation and lifecycle tracking for federal compliance.',
  'Mission-focused mobility planning and readiness solutions.',
  'Real-time tracking, regulatory alignment, and audit preparation.'
];

let currentIndex = 0;
let timer;
const interval = 7000; // milliseconds

const imageEl = document.getElementById('focus-image');
const titleEl = document.getElementById('focus-title');
const descEl = document.getElementById('focus-desc');
const btnEls = document.querySelectorAll('.focus-btn');

// MANUAL BUTTON CLICK
btnEls.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    setFocus(index);
    resetTimer();
  });
});

// SET FOCUS DISPLAY
function setFocus(index) {
  currentIndex = index;
  imageEl.src = focusImages[index];
  titleEl.textContent = focusTitles[index];
  descEl.textContent = focusDescriptions[index];

  btnEls.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
    const progress = btn.querySelector('.progress');
    progress.style.width = i === index ? '0%' : '0%';
  });
}

// AUTO ROTATE FUNCTION
function rotateFocus() {
  currentIndex = (currentIndex + 1) % focusImages.length;
  setFocus(currentIndex);
}

// PROGRESS BAR UPDATE
function animateProgress() {
  btnEls.forEach((btn, i) => {
    const progress = btn.querySelector('.progress');
    if (i === currentIndex) {
      progress.style.transition = `width ${interval}ms linear`;
      progress.style.width = '100%';
    } else {
      progress.style.transition = 'none';
      progress.style.width = '0%';
    }
  });
}

// START AUTO ROTATION
function startTimer() {
  setFocus(currentIndex);
  animateProgress();
  timer = setInterval(() => {
    rotateFocus();
    animateProgress();
  }, interval);
}

function resetTimer() {
  clearInterval(timer);
  startTimer();
}

// Start on load
startTimer();
