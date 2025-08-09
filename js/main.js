/* ---------- Typing Animation System (Hero Only) ---------- */
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
      const heroOverlay = heroSection.querySelector('.hero-overlay');
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

/* ---------- Hero Video and Overlay ---------- */
(function(){
  const heroVideo = document.getElementById('hero-video');
  const heroOverlay = document.querySelector('.hero-overlay');
  
  if (heroVideo && heroOverlay) {
    // Ensure video loads and plays
    heroVideo.addEventListener('loadeddata', function() {
      console.log('Hero video loaded successfully');
    });
    
    heroVideo.addEventListener('error', function() {
      console.error('Error loading hero video');
      // Add a fallback background if video fails to load
      document.getElementById('hero').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    });
    
    // Ensure overlay is visible
    heroOverlay.style.display = 'flex';
  }
})();

/* ---------- Our Solutions: custom slider ---------- */
(function(){
  const track = document.getElementById('solutions-track');
  const slides = Array.from(track.children);
  const prev = document.getElementById('solutions-prev');
  const next = document.getElementById('solutions-next');
  let idx = 0, auto;

  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
  }
  function start(){ stop(); auto = setInterval(()=>go(idx+1), 5000); }
  function stop(){ if(auto) clearInterval(auto); }

  prev.addEventListener('click', ()=>{ stop(); go(idx-1); start(); });
  next.addEventListener('click', ()=>{ stop(); go(idx+1); start(); });

  // basic swipe
  let startX=null;
  track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; stop(); }, {passive:true});
  track.addEventListener('touchmove', e=>{
    if(startX===null) return;
    const dx = e.touches[0].clientX - startX;
    if(Math.abs(dx) > 50){
      go(idx + (dx<0 ? 1 : -1)); startX=null; start();
    }
  }, {passive:true});

  start();
})();

/* ---------- Strategic Focus Areas: tabs + progress + slider ---------- */
(function(){
  const buttons = document.querySelectorAll('#focus-areas .focus-btn');
  const bars = document.querySelectorAll('#focus-areas .progress');
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
  });

  // swipe support for focus carousel
  let startX=null;
  track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; clearTimeout(timer); }, {passive:true});
  track.addEventListener('touchmove', e=>{
    if(startX===null) return;
    const dx = e.touches[0].clientX - startX;
    if(Math.abs(dx) > 50){
      i = (i + (dx<0 ? 1 : -1) + count) % count;
      setActive(i);
      startX=null;
      cycle();
    }
  }, {passive:true});

  // init
  setActive(i);
  cycle();
})();

