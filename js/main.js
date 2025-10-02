/* ============= Theme System (Dark Mode Default) ============= */
(function() {
  const html = document.documentElement;
  
  // Set dark theme as default
  html.setAttribute('data-theme', 'dark');
})();

/* ============= Typing Animation System (Hero Only) ============= */
(function(){
  // Typing animation configuration
  const typingConfig = {
    speed: 40, // milliseconds per character
    delay: 300, // delay before starting animation
    cursor: '|', // cursor character
    cursorBlinkSpeed: 500, // cursor blink speed
    staggerDelay: 200 // delay between multiple elements in the same section
  };

  // Type writer effect
  function typeWriter(element, text, speed = typingConfig.speed) {
    return new Promise((resolve) => {
      const cleanTextContent = text.replace(/\s+/g, ' ').trim();
      element.textContent = '';
      element.classList.add('typing-in-progress');
      
      let i = 0;
      const interval = setInterval(() => {
        if (i < cleanTextContent.length) {
          element.textContent += cleanTextContent.charAt(i);
          i++;
        } else {
          clearInterval(interval);
          element.classList.remove('typing-in-progress');
          element.classList.add('typing-completed');
          resolve();
        }
      }, speed);
    });
  }

  // Add cursor effect
  function addCursor(element) {
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = typingConfig.cursor;
    cursor.style.animation = `blink ${typingConfig.cursorBlinkSpeed}ms infinite`;
    element.appendChild(cursor);
  }

  // Remove cursor effect
  function removeCursor(element) {
    const cursor = element.querySelector('.typing-cursor');
    if (cursor) {
      cursor.remove();
    }
  }

  // Animate a single element
  async function animateElement(element) {
    if (element.classList.contains('typing-animated')) return;
    
    const originalText = element.textContent.trim();
    if (originalText.length === 0) return;

    element.classList.add('typing-animated');
    element.style.visibility = 'hidden'; // Hide until animation starts
    
    // Wait for element to be in view
    await new Promise(resolve => setTimeout(resolve, typingConfig.delay));
    
    element.style.visibility = 'visible';
    addCursor(element);
    
    await typeWriter(element, originalText);
    removeCursor(element);
  }

  // Initialize typing animations for hero section only
  function initHeroTypingAnimations() {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroOverlay = heroSection.querySelector('.hero-content');
      if (heroOverlay) {
        const heroTextElements = heroOverlay.querySelectorAll('h1, p, a');
        heroTextElements.forEach((element, index) => {
          if (!element.classList.contains('typing-animated')) {
            setTimeout(() => {
              animateElement(element);
            }, index * 500); // Stagger hero animations
          }
        });
      }
    }
  }

  // Start animations when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroTypingAnimations);
  } else {
    initHeroTypingAnimations();
  }

  // Re-initialize for dynamically loaded content
  window.addEventListener('load', () => {
    setTimeout(initHeroTypingAnimations, 1000);
  });
})();

/* ============= Hero Video Sequence ============= */
(function(){
  const heroVideo = document.getElementById('hero-video');
  const heroOverlay = document.querySelector('.hero-content');
  
  // Video sequence array
  const videoSequence = [
    'videos/hero1.mp4',
    'videos/hero2.mp4', 
    'videos/hero3.mp4'
  ];
  
  let currentVideoIndex = 0;
  
  if (heroVideo) {
    // Function to load next video in sequence
    function loadNextVideo() {
      if (currentVideoIndex < videoSequence.length - 1) {
        currentVideoIndex++;
      } else {
        currentVideoIndex = 0; // Loop back to first video
      }
      
      heroVideo.src = videoSequence[currentVideoIndex];
      heroVideo.load();
    }
    
    // When video ends, load next video
    heroVideo.addEventListener('ended', function() {
      loadNextVideo();
    });
    
    // Ensure video loads and plays
    heroVideo.addEventListener('loadeddata', function() {
      console.log(`Hero video ${currentVideoIndex + 1} loaded successfully`);
      heroVideo.play();
    });
    
    heroVideo.addEventListener('error', function() {
      console.error(`Error loading hero video ${currentVideoIndex + 1}`);
      // Try to load next video on error
      loadNextVideo();
    });
    
    // Ensure overlay is visible
    if (heroOverlay) {
      heroOverlay.style.display = 'flex';
    }
  }
})();

/* ============= Enhanced Solutions Carousel ============= */
(function(){
  const track = document.getElementById('solutions-track');
  const slides = Array.from(track.children);
  const prev = document.getElementById('solutions-prev');
  const next = document.getElementById('solutions-next');
  let idx = 0, auto;

  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    
    // Update ARIA attributes
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
      slide.setAttribute('aria-hidden', index !== idx ? 'true' : 'false');
    });
  }
  
  function start(){ 
    stop(); 
    auto = setInterval(()=>go(idx+1), 5000); 
  }
  
  function stop(){ 
    if(auto) clearInterval(auto); 
  }

  // Button controls
  if (prev) prev.addEventListener('click', ()=>{ stop(); go(idx-1); start(); });
  if (next) next.addEventListener('click', ()=>{ stop(); go(idx+1); start(); });

  // Keyboard controls
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stop();
      go(idx-1);
      start();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stop();
      go(idx+1);
      start();
    }
  });

  // Touch/swipe support
  let startX = null;
  track.addEventListener('touchstart', e => { 
    startX = e.touches[0].clientX; 
    stop(); 
  }, {passive: true});
  
  track.addEventListener('touchmove', e => {
    if(startX === null) return;
    const dx = e.touches[0].clientX - startX;
    if(Math.abs(dx) > 50){
      go(idx + (dx<0 ? 1 : -1)); 
      startX = null; 
      start();
    }
  }, {passive: true});

  // Initialize
  go(0);
  start();
})();

/* ============= Enhanced Focus Areas Tabs ============= */
(function(){
  const buttons = document.querySelectorAll('#focus-areas .focus-tab');
  const bars = document.querySelectorAll('#focus-areas .tab-progress');
  const track = document.getElementById('focus-track');
  const count = buttons.length;
  let i = 0, timer;

  function setActive(n){
    // move track
    track.style.transform = `translateX(-${n * 100}%)`;
    
    // buttons state + progress reset
    buttons.forEach((b, k)=>{
      b.classList.toggle('active', k===n);
      b.setAttribute('aria-selected', k===n ? 'true' : 'false');
      bars[k].style.width = '0%';
      bars[k].style.transition = 'none';
    });
    
    // kick progress animation for active
    setTimeout(()=>{
      bars[n].style.transition = 'width 5s linear';
      bars[n].style.width = '100%';
    }, 50);
  }

  function cycle(){
    clearTimeout(timer);
    setActive(i);
    timer = setTimeout(()=>{
      i = (i + 1) % count;
      cycle();
    }, 5000);
  }

  buttons.forEach((btn, idx)=>{
    btn.addEventListener('click', ()=>{
      clearTimeout(timer);
      i = idx;
      cycle();
    });
    
    // Keyboard navigation
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clearTimeout(timer);
        i = idx;
        cycle();
      }
    });
  });

  // Arrow key navigation for tabs
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('#focus-areas .focus-tabs')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        clearTimeout(timer);
        i = (i - 1 + count) % count;
        cycle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        clearTimeout(timer);
        i = (i + 1) % count;
        cycle();
      }
    }
  });

  // Touch support for focus carousel
  let startX = null;
  track.addEventListener('touchstart', e => { 
    startX = e.touches[0].clientX; 
    clearTimeout(timer); 
  }, {passive: true});
  
  track.addEventListener('touchmove', e => {
    if(startX === null) return;
    const dx = e.touches[0].clientX - startX;
    if(Math.abs(dx) > 50){
      i = (i + (dx<0 ? 1 : -1) + count) % count;
      setActive(i);
      startX = null;
      cycle();
    }
  }, {passive: true});

  // init
  setActive(i);
  cycle();
})();

/* ============= Scroll Indicator ============= */
(function(){
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const solutionsSection = document.getElementById('solutions');
      if (solutionsSection) {
        solutionsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
})();

/* ============= Logo Overlay Effect ============= */
(function(){
  const logoOverlay = document.querySelector('.logo-overlay');
  
  if (logoOverlay) {
    // Add subtle animation on scroll
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled > 50) {
        logoOverlay.style.transform = 'scale(0.95)';
        logoOverlay.style.opacity = '0.9';
      } else {
        logoOverlay.style.transform = 'scale(1)';
        logoOverlay.style.opacity = '1';
      }
    });
  }
})();

/* ============= Intersection Observer for Animations ============= */
(function(){
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe sections for animation
  document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      observer.observe(section);
    });
  });
})();

/* ============= Footer Year Update ============= */
(function(){
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
})();

/* ============= Smooth Scrolling for Internal Links ============= */
(function(){
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const targetPosition = targetElement.offsetTop - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();

/* ============= Reduced Motion Support ============= */
(function(){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  function handleReducedMotion() {
    if (prefersReducedMotion.matches) {
      // Disable animations
      document.documentElement.style.setProperty('--fast', '0ms');
      document.documentElement.style.setProperty('--normal', '0ms');
      document.documentElement.style.setProperty('--slow', '0ms');
    } else {
      // Restore animations
      document.documentElement.style.setProperty('--fast', '140ms');
      document.documentElement.style.setProperty('--normal', '220ms');
      document.documentElement.style.setProperty('--slow', '400ms');
    }
  }
  
  handleReducedMotion();
  prefersReducedMotion.addEventListener('change', handleReducedMotion);
})();