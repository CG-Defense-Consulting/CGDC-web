document.addEventListener('DOMContentLoaded', () => {
  // Hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(link.getAttribute('href'))?.scrollIntoView({
        behavior: 'smooth'
      });
      menu.classList.remove('open');
    });
  });

  // Strategic Focus Area
  const focusImages = [
    'images/icon-manufacturing.jpg',
    'images/icon-supply-chain.jpg',
    'images/icon-ai-data.jpg',
    'images/icon-contact.jpg',
    'images/icon-logistics.jpg',
    'images/icon-compliance.jpg'
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
    'Resilient logistics and material readiness across distributed networks.',
    'Real-time data modeling and actionable insights for warfighter operations.',
    'Streamlined quote-to-contract workflows with traceable compliance.',
    'Optimized routing, asset tracking, and sustainment logistics.',
    'Expertise in navigating DFARS, BAA, and ITAR with AI-enhanced auditing.'
  ];

  const buttons = document.querySelectorAll('.focus-btn');
  const progressBars = document.querySelectorAll('.focus-btn .progress');
  const imageEl = document.getElementById('focus-image');
  const titleEl = document.getElementById('focus-title');
  const descEl = document.getElementById('focus-desc');

  let currentIndex = 0;
  let intervalTime = 6000;
  let progressInterval;

  function updateFocus(index) {
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
      progressBars[i].style.width = i === index ? '0%' : '0%';
    });

    imageEl.src = focusImages[index];
    titleEl.textContent = focusTitles[index];
    descEl.textContent = focusDescriptions[index];

    animateProgress(index);
    currentIndex = index;
  }

  function animateProgress(index) {
    let width = 0;
    const interval = 100;
    const step = (interval / intervalTime) * 100;

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      width += step;
      if (width >= 100) {
        width = 100;
        clearInterval(progressInterval);
        let nextIndex = (index + 1) % focusImages.length;
        updateFocus(nextIndex);
      }
      progressBars[index].style.width = `${width}%`;
    }, interval);
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      updateFocus(i);
    });
  });

  updateFocus(0); // Initial
});
