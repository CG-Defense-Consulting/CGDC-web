// ========== MOBILE NAV ==========
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', () => {
  menu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ========== STRATEGIC FOCUS AREA CAROUSEL ==========
const focusData = [
  {
    title: "Defense Manufacturing",
    desc: "End-to-end support for defense contractors, from sourcing to assembly oversight.",
    img: "images/icon-manufacturing.jpg"
  },
  {
    title: "Supply Chain",
    desc: "Real-time visibility and optimization across global defense logistics networks.",
    img: "images/icon-supply-chain.jpg"
  },
  {
    title: "AI & Data",
    desc: "Actionable insights with AI/ML to power mission readiness and operations.",
    img: "images/icon-ai-data.jpg"
  },
  {
    title: "Contract Management",
    desc: "Automated contract workflows and performance analytics for federal contracts.",
    img: "images/icon-contact.jpg"
  },
  {
    title: "Logistics",
    desc: "Streamlining inventory, transport, and fulfillment for defense systems.",
    img: "images/icon-logistics.jpg"
  },
  {
    title: "Compliance",
    desc: "Ensure audit-ready compliance with NIST, DFARS, ITAR and cybersecurity mandates.",
    img: "images/icon-compliance.jpg"
  }
];

const focusImage = document.getElementById('focus-image');
const focusTitle = document.getElementById('focus-title');
const focusDesc = document.getElementById('focus-desc');
const buttons = document.querySelectorAll('.focus-btn');
const progressBars = document.querySelectorAll('.focus-btn .progress');

let currentFocus = 0;
let interval;
const intervalDuration = 5000;

function showFocus(index, direction = 'right') {
  focusImage.classList.remove('slide-left', 'slide-right');

  void focusImage.offsetWidth; // Force reflow

  focusImage.classList.add(direction === 'left' ? 'slide-left' : 'slide-right');

  const data = focusData[index];
  focusImage.src = data.img;
  focusTitle.textContent = data.title;
  focusDesc.textContent = data.desc;

  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
    btn.querySelector('.progress').style.width = i === index ? '0%' : '0%';
  });
}

function startCarousel() {
  clearInterval(interval);
  let start = Date.now();

  interval = setInterval(() => {
    const previous = currentFocus;
    currentFocus = (currentFocus + 1) % focusData.length;
    showFocus(currentFocus, 'right');
    startProgressBar(currentFocus);
  }, intervalDuration);

  startProgressBar(currentFocus);
}

function startProgressBar(index) {
  const progress = buttons[index].querySelector('.progress');
  progress.style.transition = 'none';
  progress.style.width = '0%';

  setTimeout(() => {
    progress.style.transition = `width ${intervalDuration}ms linear`;
    progress.style.width = '100%';
  }, 50);
}

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    clearInterval(interval);
    const prevIndex = currentFocus;
    const direction = i > prevIndex ? 'right' : 'left';
    currentFocus = i;
    showFocus(i, direction);
    startCarousel();
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showFocus(currentFocus);
  startCarousel();
});
