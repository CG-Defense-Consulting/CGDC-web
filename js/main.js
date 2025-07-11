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
const focusButtons = document.querySelectorAll('.focus-btn');
const progressBars = document.querySelectorAll('.focus-btn .progress');
const focusImage = document.getElementById('focus-image');
const focusTitle = document.getElementById('focus-title');
const focusDesc = document.getElementById('focus-desc');

const focusData = [
  { img: 'images/focus1.jpg', title: 'Defense Manufacturing', desc: 'End-to-end support for defense contractors, from sourcing to assembly oversight.' },
  { img: 'images/focus2.jpg', title: 'Supply Chain Optimization', desc: 'Streamline supplier networks with AI-driven insights.' },
  { img: 'images/focus3.jpg', title: 'AI & Data Analytics', desc: 'Custom forecasting engines and real-time decision platforms.' },
  { img: 'images/focus4.jpg', title: 'Contract Management', desc: 'Automated quotes and e-signature workflows for defense contracts.' },
  { img: 'images/focus5.jpg', title: 'Logistics & Distribution', desc: 'Global shipping strategies, warehousing, and compliance support.' },
  { img: 'images/focus6.jpg', title: 'Regulatory Compliance', desc: 'Ensure every procurement step meets defense and federal standards.' }
];

let currentFocus = 0;
let interval;
let progress = 0;

function showFocus(index) {
  focusButtons.forEach(btn => btn.classList.remove('active'));
  focusButtons[index].classList.add('active');
  focusImage.src = focusData[index].img;
  focusTitle.textContent = focusData[index].title;
  focusDesc.textContent = focusData[index].desc;
  progressBars.forEach(p => p.style.width = '0%');
  progress = 0;
}

function startFocusRotation() {
  clearInterval(interval);
  interval = setInterval(() => {
    progress += 1;
    if (progress > 100) {
      currentFocus = (currentFocus + 1) % focusData.length;
      showFocus(currentFocus);
      progress = 0;
    }
    progressBars[currentFocus].style.width = progress + '%';
  }, 100);
}

focusButtons.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    currentFocus = idx;
    showFocus(currentFocus);
    progress = 0;
  });
});

showFocus(0);
startFocusRotation();


// Force-play all videos once the page loads (catches any autoplay blocks)
window.addEventListener('load', () => {
  document.querySelectorAll('video').forEach(video => {
    // ensure inline playback
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    // already muted, but re-assign to be safe
    video.muted = true;
    // attempt play
    const p = video.play();
    if (p && p.catch) p.catch(err => {
      console.warn('Video autoplay prevented:', err);
    });
  });
});
