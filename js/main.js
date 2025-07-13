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

const buttons = document.querySelectorAll('.focus-btn');
const img = document.getElementById('focus-image');
const titleEl = document.getElementById('focus-title');
const descEl = document.getElementById('focus-desc');
let current = 0, timer;

function show(i) {
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = focusData[i].img;
    titleEl.textContent = focusData[i].title;
    descEl.textContent = focusData[i].desc;
    img.style.opacity = 1;
  }, 500);

  buttons.forEach((b, idx) => {
    b.classList.toggle('active', idx === i);
    b.querySelector('.progress').style.width = '0%';
  });
}

function start() {
  clearTimeout(timer);
  buttons[current].querySelector('.progress').style.width = '0';
  setTimeout(() => {
    buttons[current].querySelector('.progress').style.width = '100%';
  }, 50);

  timer = setTimeout(() => {
    current = (current + 1) % focusData.length;
    show(current);
    start();
  }, 5000);
}

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    current = i;
    show(i);
    start();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  show(0);
  start();
});
