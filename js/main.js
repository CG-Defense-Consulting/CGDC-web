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

  // Roll up animation effect
  function rollUpAnimation(element, text, speed = typingConfig.speed) {
    return new Promise((resolve) => {
      const cleanTextContent = text.replace(/\s+/g, ' ').trim();
      element.textContent = '';
      element.classList.add('roll-up-in-progress');
      
      // Create a container for the rolling effect
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      container.style.height = '1.2em';
      container.style.display = 'inline-block';
      
      // Create the text element that will roll up
      const textElement = document.createElement('div');
      textElement.textContent = cleanTextContent;
      textElement.style.position = 'absolute';
      textElement.style.top = '100%';
      textElement.style.transition = `transform ${speed * cleanTextContent.length}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
      textElement.style.transform = 'translateY(0)';
      
      container.appendChild(textElement);
      element.appendChild(container);
      
      // Trigger the roll-up animation
      setTimeout(() => {
        textElement.style.transform = 'translateY(-100%)';
      }, 50);
      
      // Complete the animation
      setTimeout(() => {
        element.textContent = cleanTextContent;
        element.classList.remove('roll-up-in-progress');
        element.classList.add('roll-up-completed');
        resolve();
      }, speed * cleanTextContent.length + 100);
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
    if (element.classList.contains('typing-animated') || element.classList.contains('roll-up-animated')) return;
    
    const originalText = element.textContent.trim();
    if (originalText.length === 0) return;

    // Use roll-up animation for h1 elements, typing for others
    if (element.tagName === 'H1') {
      element.classList.add('roll-up-animated');
      element.style.visibility = 'hidden'; // Hide until animation starts
      
      // Wait for element to be in view
      await new Promise(resolve => setTimeout(resolve, typingConfig.delay));
      
      element.style.visibility = 'visible';
      
      await rollUpAnimation(element, originalText);
    } else {
      element.classList.add('typing-animated');
      element.style.visibility = 'hidden'; // Hide until animation starts
      
      // Wait for element to be in view
      await new Promise(resolve => setTimeout(resolve, typingConfig.delay));
      
      element.style.visibility = 'visible';
      addCursor(element);
      
      await typeWriter(element, originalText);
      removeCursor(element);
    }
  }

  // Initialize typing animations for hero section only (excluding h1, subhead, and buttons which use roll-up or static display)
  function initHeroTypingAnimations() {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroOverlay = heroSection.querySelector('.hero-content');
      if (heroOverlay) {
        // No elements in hero section use typing animation anymore
        // H1 and subhead use roll-up, buttons appear statically
        console.log('Hero typing animations disabled - using roll-up and static display');
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


/* ============= Scroll Indicator ============= */
(function(){
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const contentSection = document.getElementById('content');
      if (contentSection) {
        contentSection.scrollIntoView({ 
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

// Hero H1 roll-up animation (Palantir-style)
(function rollupHero() {
  const h1 = document.querySelector('.rollup-h1');
  const subhead = document.querySelector('.rollup-subhead');
  
  if (!h1) {
    console.log('Rollup: H1 not found');
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Process H1
  const originalH1 = h1.textContent.trim();
  console.log('Rollup: Original H1 text:', originalH1);

  // Split H1 into word wrappers: <span class="rollup-word"><span>Word</span></span>
  const h1Words = originalH1.split(/\s+/).map((w) => {
    const outer = document.createElement('span');
    outer.className = 'rollup-word';
    const inner = document.createElement('span');
    inner.textContent = w;
    outer.appendChild(inner);
    return outer;
  });

  // Replace H1 content
  h1.textContent = '';
  h1Words.forEach((w, index) => {
    h1.appendChild(w);
    // Add space between words (except after the last word)
    if (index < h1Words.length - 1) {
      h1.appendChild(document.createTextNode(' '));
    }
  });
  console.log('Rollup: H1 words created:', h1Words.length);

  // Process subhead if it exists
  let subheadWords = [];
  if (subhead) {
    const originalSubhead = subhead.textContent.trim();
    console.log('Rollup: Original subhead text:', originalSubhead);

    // Split subhead into word wrappers
    subheadWords = originalSubhead.split(/\s+/).map((w) => {
      const outer = document.createElement('span');
      outer.className = 'rollup-word';
      const inner = document.createElement('span');
      inner.textContent = w;
      outer.appendChild(inner);
      return outer;
    });

    // Replace subhead content
    subhead.textContent = '';
    subheadWords.forEach((w, index) => {
      subhead.appendChild(w);
      // Add space between words (except after the last word)
      if (index < subheadWords.length - 1) {
        subhead.appendChild(document.createTextNode(' '));
      }
    });
    console.log('Rollup: Subhead words created:', subheadWords.length);
  }

  // If reduced motion, activate immediately
  if (reduceMotion) {
    console.log('Rollup: Reduced motion detected, activating immediately');
    document.querySelector('.hero-section')?.classList.add('rollup-active');
    return;
  }

  // One-time IntersectionObserver to trigger when hero enters viewport
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) {
    console.log('Rollup: Hero section not found');
    return;
  }

  console.log('Rollup: Setting up intersection observer');

  const io = new IntersectionObserver((entries) => {
    const e = entries[0];
    console.log('Rollup: Intersection event:', e.isIntersecting);
    if (!e?.isIntersecting) return;

    console.log('Rollup: Activating animation');

    // Stagger: 60ms per word feels right; cap total to avoid long tails
    const base = 60; // ms
    const maxDelay = 900; // ms cap
    
    // Animate H1 words
    h1Words.forEach((w, i) => {
      const inner = w.firstElementChild;
      const delay = Math.min(i * base, maxDelay);
      inner.style.transitionDelay = `${delay}ms`;
    });

    // Animate subhead words with a slight delay after H1
    if (subheadWords.length > 0) {
      const subheadDelay = Math.min(h1Words.length * base, maxDelay) + 200; // Start after H1 + 200ms
      subheadWords.forEach((w, i) => {
        const inner = w.firstElementChild;
        const delay = Math.min(subheadDelay + (i * base), maxDelay + subheadDelay);
        inner.style.transitionDelay = `${delay}ms`;
      });
    }

    heroSection.classList.add('rollup-active');
    io.disconnect(); // run once
  }, { rootMargin: '-10% 0px -10% 0px', threshold: 0.2 });

  io.observe(heroSection);

  // Fallback: activate after 1 second if intersection observer doesn't trigger
  setTimeout(() => {
    if (!heroSection.classList.contains('rollup-active')) {
      console.log('Rollup: Fallback activation');
      const base = 60;
      const maxDelay = 900;
      
      // Animate H1 words
      h1Words.forEach((w, i) => {
        const inner = w.firstElementChild;
        const delay = Math.min(i * base, maxDelay);
        inner.style.transitionDelay = `${delay}ms`;
      });

      // Animate subhead words with a slight delay after H1
      if (subheadWords.length > 0) {
        const subheadDelay = Math.min(h1Words.length * base, maxDelay) + 200;
        subheadWords.forEach((w, i) => {
          const inner = w.firstElementChild;
          const delay = Math.min(subheadDelay + (i * base), maxDelay + subheadDelay);
          inner.style.transitionDelay = `${delay}ms`;
        });
      }
      
      heroSection.classList.add('rollup-active');
    }
  }, 1000);
})();

// Login overlay dropdown (accessible, no libs)
(function () {
  const btn = document.querySelector('.login-trigger');
  const menu = document.getElementById('login-menu');
  const loginOverlay = document.querySelector('.login-overlay');
  if (!btn || !menu || !loginOverlay) return;

  const open  = () => { menu.dataset.open = "true";  btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.dataset.open = "false"; btn.setAttribute('aria-expanded', 'false'); };

  // Toggle on click
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    (menu.dataset.open === "true") ? close() : open();
  });

  // Close when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) close();
  });

  // Keyboard: Esc to close; ArrowDown focuses first item
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open();
      const first = menu.querySelector('a');
      first && first.focus();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Basic focus trap inside menu
  menu.addEventListener('keydown', (e) => {
    const items = Array.from(menu.querySelectorAll('a'));
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[idx + 1] || items[0]).focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); (items[idx - 1] || items.at(-1)).focus(); }
    if (e.key === 'Tab') close();
  });

  // Hide login overlay when scrolling down
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      // Scrolled down - hide login overlay
      loginOverlay.style.opacity = '0';
      loginOverlay.style.transform = 'translateY(-20px)';
      close(); // Close menu if open
    } else {
      // Scrolled up or at top - show login overlay
      loginOverlay.style.opacity = '1';
      loginOverlay.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
  });
})();

// Accessible tabs with optional image swapping per group
(function tabsController() {
  function initTabs() {
    const groups = document.querySelectorAll('.tabs');
    if (!groups.length) return;

  function swapImage(imgEl, src, alt) {
    if (!imgEl || !src) return;
    // Cheap crossfade, respects reduced motion automatically
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) imgEl.style.opacity = '0.001';
    const done = () => {
      if (!reduce) imgEl.style.opacity = '';
      imgEl.removeEventListener('load', done);
    };
    imgEl.addEventListener('load', done);
    imgEl.src = src;
    if (alt) imgEl.alt = alt;
  }

  groups.forEach(group => {
    const list = group.querySelector('.tablist');
    const tabs = list ? Array.from(list.querySelectorAll('[role="tab"]')) : [];
    
    // For Trust section, look for panels in the band-visual container
    let panels;
    if (group.dataset.tabs === 'trust') {
      const bandSection = group.closest('.band');
      const bandVisual = bandSection ? bandSection.querySelector('.band-visual') : null;
      panels = bandVisual ? Array.from(bandVisual.querySelectorAll('[role="tabpanel"]')) : [];
    } else {
      panels = Array.from(group.querySelectorAll('[role="tabpanel"]'));
    }
    
    if (!tabs.length || !panels.length) return;

    const bandSection = group.closest('.band');
    const bandImage = bandSection ? bandSection.querySelector('[data-tab-image]') : null;
    

    function activate(tab) {
      tabs.forEach(t => {
        const selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
        
        // For Trust section, look for panel in band-visual container
        let panel;
        if (group.dataset.tabs === 'trust') {
          const bandSection = group.closest('.band');
          const bandVisual = bandSection ? bandSection.querySelector('.band-visual') : null;
          panel = bandVisual ? bandVisual.querySelector('#' + t.getAttribute('aria-controls')) : null;
        } else {
          panel = group.querySelector('#' + t.getAttribute('aria-controls'));
        }
        
        if (panel) panel.hidden = !selected;
      });

      // Guild section image is static - no dynamic switching

      // Optional image swap (only if data present) - for other sections
      const src = tab.dataset.img;
      const alt = tab.dataset.alt;
      if (bandImage && src) swapImage(bandImage, src, alt || bandImage.alt);
    }

    // Init to the currently selected tab
    const current = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (current) activate(current);

    // Click
    tabs.forEach(t => t.addEventListener('click', () => activate(t)));

    // Keyboard
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); activate(tabs[(i+1)%tabs.length]); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); activate(tabs[(i-1+tabs.length)%tabs.length]); }
      if (e.key === 'Home')       { e.preventDefault(); activate(tabs[0]); }
      if (e.key === 'End')        { e.preventDefault(); activate(tabs.at(-1)); }
    });
  });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
})();