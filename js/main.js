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
const focusItems = [
  {
    title: "Defense Manufacturing",
    desc: "End-to-end support for defense contractors, from sourcing to assembly oversight.",
    img: "images/icon-manufacturing.jpg"
  },
  {
    title: "Supply Chain",
    desc: "Real-time visibility and AI-driven optimization across global defense logistics networks.",
    img: "images/icon-supply-chain.jpg"
  },
  {
    title: "AI & Data",
    desc: "Actionable insights with AI/ML to power mission readiness and operations.",
    img: "images/icon-ai-data.jpg"
  },
  {
    title: "Contract Management",
    desc: "Automated workflows and performance analytics for federal contracts.",
    img: "images/icon-contact.jpg"
  },
  {
    title: "Logistics",
    desc: "Streamlined inventory, transport, and fulfillment for defense systems.",
    img: "images/icon-logistics.jpg"
  },
  {
    title: "Compliance",
    desc: "Ensure audit-ready compliance with NIST, DFARS, ITAR & cybersecurity mandates.",
    img: "images/icon-compliance.jpg"
  }
];

const buttons = document.querySelectorAll('.focus-btn');
const progressBars = document.querySelectorAll('.focus-btn .progress');
const track = document.querySelector('.carousel-track');
let currentIndex = 0, timer;

function updateCarousel(index) {
  track.style.transform = `translateX(-${index * 100}%)`;

  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
    progressBars[i].style.width = '0%';
    progressBars[i].style.transition = 'none';
  });

  setTimeout(() => {
    progressBars[index].style.transition = 'width 5s linear';
    progressBars[index].style.width = '100%';
  }, 50);
}

function rotateCarousel() {
  clearTimeout(timer);
  updateCarousel(currentIndex);

  timer = setTimeout(() => {
    currentIndex = (currentIndex + 1) % focusItems.length;
    rotateCarousel();
  }, 5000);
}

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    clearTimeout(timer);
    currentIndex = i;
    rotateCarousel();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  updateCarousel(currentIndex);
  rotateCarousel();
});

// ===== TYPEWRITER ON SCROLL FOR ALL H2 & H3 =====
const headings = document.querySelectorAll('h2, h3');
const typedHeadings = new Set();

function typeWriter(el, text) {
  el.textContent = '';
  let idx = 0;
  const interval = setInterval(() => {
    el.textContent += text.charAt(idx);
    idx++;
    if (idx >= text.length) clearInterval(interval);
  }, 40);
}

const headingObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !typedHeadings.has(entry.target)) {
      const el = entry.target;
      const txt = el.textContent.trim();
      typeWriter(el, txt);
      typedHeadings.add(el);
    }
  });
}, { threshold: 0.6 });

// Start observing all H2 and H3
headings.forEach(h => headingObserver.observe(h));
