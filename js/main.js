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

/* ============= Logo Overlay Effect & Navigation Bar ============= */
(function(){
  const logoOverlay = document.querySelector('.logo-overlay');
  const heroSection = document.getElementById('hero');
  const investorsHero = document.getElementById('investors-hero');
  const mainNav = document.getElementById('main-nav');
  const isInvestorsPage = document.body.classList.contains('investors-page');
  
  // Only apply logo fade on homepage, not investors page
  if (heroSection && !isInvestorsPage) {
    let ticking = false;
    
    function updateScrollEffects() {
      const scrolled = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      
      // Logo fade-out (only on homepage)
      if (logoOverlay) {
        const fadeProgress = Math.min(scrolled / heroHeight, 1);
        const opacity = 1 - fadeProgress;
        logoOverlay.style.opacity = Math.max(0, opacity);
      }
      
      // Navigation bar fade-in
      if (mainNav && !isInvestorsPage) {
        // Start appearing when scrolled 30% through hero, fully visible when past hero
        const navStartProgress = 0.3;
        const navProgress = Math.max(0, (scrolled / heroHeight - navStartProgress) / (1 - navStartProgress));
        const navOpacity = Math.min(1, navProgress);
        
        // Get the Guild Login button
        const guildLoginBtn = mainNav.querySelector('.nav-btn-guild');
        
        if (navOpacity > 0) {
          mainNav.style.opacity = navOpacity;
          mainNav.style.transform = `translateY(${-20 * (1 - navOpacity)}px)`;
          mainNav.style.pointerEvents = navOpacity > 0.5 ? 'auto' : 'none';
          
          // Change "Guild Login" to "Login" when menu appears
          if (guildLoginBtn && navOpacity > 0.5) {
            guildLoginBtn.textContent = 'Login';
          }
        } else {
          mainNav.style.opacity = '0';
          mainNav.style.transform = 'translateY(-20px)';
          mainNav.style.pointerEvents = 'none';
          
          // Change back to "Guild Login" when menu is hidden
          if (guildLoginBtn) {
            guildLoginBtn.textContent = 'Guild Login';
          }
        }
      }
      
      ticking = false;
    }
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    });
    
    // Initial call
    updateScrollEffects();
  } else if (isInvestorsPage && logoOverlay) {
    // On investors page, keep logo always visible
    logoOverlay.style.opacity = '1';
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
    
    // Observe company intro content specifically for fade-in from above
    const companyIntroContent = document.querySelector('.company-intro-content');
    if (companyIntroContent) {
      observer.observe(companyIntroContent);
    }
  });
})();

/* ============= Footer Year Update ============= */
(function(){
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
})();

/* ============= Spinning Hardware 3D Component ============= */
(function() {
  'use strict';
  
  // Initialize 3D hardware component in company overview section
  function initHardware3D() {
    const container = document.getElementById('company-intro-3d');
    if (!container || typeof window.SpinningHardware3D === 'undefined') {
      return;
    }
    
    // Create and initialize the component
    const hardware3D = new window.SpinningHardware3D({
      variant: 'screw',
      size: 300,
      color: '#666666',
      speed: 0.015,
      container: container
    });
    
    // Store reference for cleanup if needed
    window.companyIntroHardware3D = hardware3D;
  }
  
  // Wait for DOM and Three.js to be ready
  function waitForThreeJS(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (typeof window.THREE !== 'undefined' && typeof window.SpinningHardware3D !== 'undefined') {
        clearInterval(checkInterval);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('SpinningHardware3D: Three.js or component not loaded after timeout');
      }
    }, 50);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForThreeJS(initHardware3D);
    });
  } else {
    waitForThreeJS(initHardware3D);
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

// Coming Soon overlay for Mentat
(function () {
  const mentatLink = document.getElementById('mentat-link');
  const comingSoonOverlay = document.getElementById('coming-soon-overlay');
  const returnBtn = document.getElementById('return-to-main-btn');
  
  if (!mentatLink || !comingSoonOverlay || !returnBtn) return;

  // Show coming soon overlay when Mentat link is clicked
  mentatLink.addEventListener('click', (e) => {
    e.preventDefault();
    comingSoonOverlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  // Return to main page
  returnBtn.addEventListener('click', () => {
    comingSoonOverlay.setAttribute('hidden', '');
    document.body.style.overflow = ''; // Restore scrolling
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !comingSoonOverlay.hasAttribute('hidden')) {
      comingSoonOverlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
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

/* ============= Company Intro Scroll-Based Animation ============= */
(function() {
  const companyIntroSection = document.getElementById('company-intro');
  if (!companyIntroSection) return;
  
  const statBoxes = companyIntroSection.querySelectorAll('.company-stat-box');
  if (statBoxes.length === 0) return;
  
  let allBoxesVisible = false;
  const scrollDistancePerBox = 200; // pixels of scroll per box
  let animationStartScroll = null; // Scroll position when animation starts
  const totalScrollNeeded = statBoxes.length * scrollDistancePerBox; // Total scroll needed for all boxes
  
  // Update box opacity based on scroll position
  function updateBoxAnimations() {
    const rect = companyIntroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    const currentScroll = window.scrollY || window.pageYOffset || 
                          document.documentElement.scrollTop || 
                          document.body.scrollTop || 0;
    
    // Calculate scroll progress
    let scrollProgress = 0;
    
    // Check if section is in viewport
    if (sectionTop <= viewportHeight && sectionBottom > 0) {
      // Initialize animation start position when section first enters viewport
      if (animationStartScroll === null) {
        animationStartScroll = currentScroll;
      }
      
      // Calculate how much has scrolled since animation started
      scrollProgress = Math.max(0, currentScroll - animationStartScroll);
    } else if (sectionBottom <= 0 && animationStartScroll !== null) {
      // Section is fully scrolled past - all boxes should be visible
      scrollProgress = totalScrollNeeded;
      allBoxesVisible = true;
    } else if (sectionTop > viewportHeight) {
      // Section not yet in viewport - reset
      animationStartScroll = null;
      scrollProgress = 0;
      allBoxesVisible = false;
    }
    
    let allVisible = true;
    
    statBoxes.forEach((box, index) => {
      const boxStart = index * scrollDistancePerBox;
      const boxEnd = (index + 1) * scrollDistancePerBox;
      
      let opacity = 0;
      
      if (scrollProgress >= boxEnd) {
        // Box fully visible
        opacity = 1;
        box.classList.add('visible');
      } else if (scrollProgress >= boxStart) {
        // Box fading in
        const localProgress = (scrollProgress - boxStart) / scrollDistancePerBox;
        opacity = Math.max(0, Math.min(1, localProgress));
        box.classList.add('visible');
        allVisible = false;
      } else {
        // Box not visible yet
        opacity = 0;
        box.classList.remove('visible');
        allVisible = false;
      }
      
      box.style.opacity = opacity.toString();
    });
    
    // Update all boxes visible state
    allBoxesVisible = allVisible && scrollProgress >= totalScrollNeeded;
    
    return allBoxesVisible;
  }
  
  // Handle scroll events
  let ticking = false;
  
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateBoxAnimations();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Prevent wheel events from scrolling past until all boxes visible
  window.addEventListener('wheel', (e) => {
    if (allBoxesVisible) return; // Allow scrolling once all boxes are visible
    
    const rect = companyIntroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const currentScroll = window.scrollY || window.pageYOffset || 
                          document.documentElement.scrollTop || 
                          document.body.scrollTop || 0;
    
    // Only prevent if section is in viewport and scrolling down
    if (rect.bottom > 0 && rect.top < viewportHeight && e.deltaY > 0 && animationStartScroll !== null) {
      // Calculate the scroll position we need to reach to show all boxes
      const requiredScroll = animationStartScroll + totalScrollNeeded;
      
      // Only prevent if we haven't scrolled enough to show all boxes yet
      if (currentScroll < requiredScroll - 10) {
        // Check if this scroll would take us past the required point
        const nextScroll = currentScroll + e.deltaY;
        if (nextScroll > requiredScroll) {
          // Allow scrolling but cap it at the required point
          e.preventDefault();
          window.scrollTo({
            top: requiredScroll,
            behavior: 'auto'
          });
          return false;
        }
      }
    }
  }, { passive: false });
  
  // Initial update
  updateBoxAnimations();
  
  // Also listen for resize
  window.addEventListener('resize', () => {
    animationStartScroll = null; // Reset on resize
    updateBoxAnimations();
  }, { passive: true });
})();

/* ============= Process Section Fade-in Animation ============= */
(function() {
  // Process steps removed - section deleted
  return;
  
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop observing once visible
      }
    });
  }, observerOptions);
  
  // Process steps removed - section deleted
  // Observe each process step
  [].forEach((step, index) => {
    // Add slight delay for staggered effect
    setTimeout(() => {
      // observer.observe(step);
    }, index * 100);
  });
})();

/* ============= Technology Section Scroll Animation ============= */
(function() {
  'use strict';
  
  // Ensure video loops continuously
  function setupVideoLoop() {
    const techVideo = document.getElementById('technology-video');
    if (techVideo) {
      // Set loop attribute
      techVideo.loop = true;
      techVideo.setAttribute('loop', '');
      
      // Multiple event listeners to ensure seamless looping
      const restartVideo = () => {
        techVideo.currentTime = 0;
        const playPromise = techVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Ignore play errors (video might be paused or not ready)
          });
        }
      };
      
      // Listen for 'ended' event as fallback
      techVideo.addEventListener('ended', restartVideo, { once: false });
      
      // Also listen for 'timeupdate' to catch near-end and restart early for seamless loop
      techVideo.addEventListener('timeupdate', () => {
        // If video is very close to end (within 0.05 seconds), restart immediately
        // This prevents any visible gap at the end
        if (techVideo.duration && techVideo.currentTime >= techVideo.duration - 0.05) {
          techVideo.currentTime = 0;
        }
      });
      
      // Ensure video is playing
      const playPromise = techVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore initial play errors (autoplay might be blocked)
        });
      }
      
      // Monitor and restart if video stops for any reason
      let lastTime = techVideo.currentTime;
      const monitorInterval = setInterval(() => {
        if (techVideo.paused && !techVideo.ended) {
          techVideo.play().catch(() => {});
        }
        // If video time hasn't changed but it's not paused, restart
        if (techVideo.currentTime === lastTime && !techVideo.paused && techVideo.readyState >= 2) {
          if (techVideo.currentTime > 0.1) {
            restartVideo();
          }
        }
        lastTime = techVideo.currentTime;
      }, 1000);
      
      // Clean up interval when video element is removed
      techVideo.addEventListener('loadstart', () => {
        clearInterval(monitorInterval);
      });
    }
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // If reduced motion, just show content immediately
    const techHeading = document.querySelector('.technology-heading');
    const techText = document.querySelector('.technology-text');
    if (techHeading) techHeading.classList.add('animate-in');
    if (techText) techText.classList.add('animate-in');
    return;
  }
  
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const techHeading = entry.target.querySelector('.technology-heading');
        const techText = entry.target.querySelector('.technology-text');
        
        if (techHeading) {
          techHeading.classList.add('animate-in');
        }
        
        if (techText) {
          techText.classList.add('animate-in');
        }
        
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, observerOptions);
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupVideoLoop();
      const techSection = document.getElementById('technology');
      if (techSection) {
        observer.observe(techSection);
      }
    });
  } else {
    setupVideoLoop();
    const techSection = document.getElementById('technology');
    if (techSection) {
      observer.observe(techSection);
    }
  }
})();