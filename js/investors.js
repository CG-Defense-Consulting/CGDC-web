/* ============= Investors Page Functionality ============= */
(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMotionPaused = false;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // setupFAQ(); // FAQ section removed
    // setupProcessCards(); // Process cards removed
    // setupTimeline(); // Timeline removed
    // Handle reduced motion preference for video
    if (prefersReducedMotion) {
      const video = document.getElementById('investors-header-video');
      if (video) {
        video.pause();
        video.style.display = 'none';
      }
    }
    setupAnalytics();
    setupScrollReveals();
  }

  // Reveal hero card on load - removed, no longer needed
  function revealHeroCard() {
    // Header no longer has a card to reveal
  }

  // Hero CTA buttons - smooth scroll to sections - removed, no longer needed
  function setupHeroCTAs() {
    // CTAs removed from header
  }

  // FAQ Accordion
  function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        const shouldExpand = !isExpanded;

        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherQuestion = otherItem.querySelector('.faq-question');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherQuestion && otherAnswer) {
              otherQuestion.setAttribute('aria-expanded', 'false');
              otherAnswer.hidden = true;
              otherItem.classList.remove('expanded');
            }
          }
        });

        // Toggle current item
        question.setAttribute('aria-expanded', shouldExpand);
        answer.hidden = !shouldExpand;
        item.classList.toggle('expanded', shouldExpand);

        // Track analytics
        if (shouldExpand) {
          const faqId = question.id.replace('faq-q-', '');
          trackEvent('faq_open', {
            faq_id: faqId,
            question: question.querySelector('span').textContent
          });
        }
      });

      // Keyboard support
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }

  // Process cards hover/focus reveal
  function setupProcessCards() {
    const cards = document.querySelectorAll('.process-card');
    
    cards.forEach(card => {
      const detail = card.querySelector('.process-card-detail');
      if (!detail) return;

      // Initially hide detail
      detail.style.opacity = '0';
      detail.style.maxHeight = '0';
      detail.style.overflow = 'hidden';
      detail.style.transition = prefersReducedMotion || isMotionPaused 
        ? 'none' 
        : 'opacity 0.3s ease, max-height 0.3s ease';

      function showDetail() {
        if (prefersReducedMotion || isMotionPaused) return;
        detail.style.opacity = '1';
        detail.style.maxHeight = '200px';
      }

      function hideDetail() {
        if (prefersReducedMotion || isMotionPaused) return;
        detail.style.opacity = '0';
        detail.style.maxHeight = '0';
      }

      card.addEventListener('mouseenter', showDetail);
      card.addEventListener('mouseleave', hideDetail);
      card.addEventListener('focus', showDetail);
      card.addEventListener('blur', hideDetail);
    });
  }

  // Timeline nodes hover/focus reveal
  function setupTimeline() {
    const nodes = document.querySelectorAll('.timeline-node');
    
    nodes.forEach(node => {
      const detail = node.querySelector('.timeline-detail');
      if (!detail) return;

      // Initially hide detail
      detail.style.opacity = '0';
      detail.style.maxHeight = '0';
      detail.style.overflow = 'hidden';
      detail.style.transition = prefersReducedMotion || isMotionPaused 
        ? 'none' 
        : 'opacity 0.3s ease, max-height 0.3s ease';

      function showDetail() {
        if (prefersReducedMotion || isMotionPaused) return;
        detail.style.opacity = '1';
        detail.style.maxHeight = '100px';
        node.classList.add('active');
        
        // Track analytics
        const step = node.getAttribute('data-step');
        trackEvent('timeline_interaction', {
          step: step,
          action: 'focus'
        });
      }

      function hideDetail() {
        if (prefersReducedMotion || isMotionPaused) return;
        detail.style.opacity = '0';
        detail.style.maxHeight = '0';
        node.classList.remove('active');
      }

      node.addEventListener('mouseenter', showDetail);
      node.addEventListener('mouseleave', hideDetail);
      node.addEventListener('focus', showDetail);
      node.addEventListener('blur', hideDetail);
    });
  }

  // Pause video control
  function setupPauseMotion() {
    const btn = document.getElementById('investors-pause-video');
    const video = document.getElementById('investors-hero-video');
    if (!btn || !video) return;

    // Check for reduced motion
    if (prefersReducedMotion) {
      video.pause();
      video.style.display = 'none';
      document.body.classList.add('motion-paused', 'reduced-motion');
      btn.setAttribute('aria-pressed', 'true');
      isMotionPaused = true;
      return;
    }

    function updateButtonState() {
      const isPaused = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', (!isPaused).toString());
      btn.setAttribute('aria-label', isPaused ? 'Pause video' : 'Resume video');
      btn.setAttribute('title', isPaused ? 'Pause video' : 'Resume video');
      
      // Update icon
      const svg = btn.querySelector('svg path');
      if (svg) {
        if (isPaused) {
          // Play icon
          svg.setAttribute('d', 'M8 5v14l11-7z');
        } else {
          // Pause icon
          svg.setAttribute('d', 'M6 4h4v16H6V4zM14 4h4v16h-4V4z');
        }
      }
    }

    btn.addEventListener('click', () => {
      isMotionPaused = !isMotionPaused;
      updateButtonState();
      
      if (isMotionPaused) {
        video.pause();
        document.body.classList.add('motion-paused');
      } else {
        video.play();
        document.body.classList.remove('motion-paused');
      }
    });

    // Initialize button state
    updateButtonState();
  }

  // Scroll reveals
  function setupScrollReveals() {
    if (prefersReducedMotion || isMotionPaused) return;

    const revealElements = document.querySelectorAll('.investors-section, .process-card, .timeline-node, .investors-tile, .kpi-tile, .faq-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 60); // Staggered reveal
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // Analytics tracking
  function setupAnalytics() {
    // CTA clicks
    document.querySelectorAll('[data-analytics="cta_click"]').forEach(btn => {
      btn.addEventListener('click', () => {
        trackEvent('cta_click', {
          location: btn.getAttribute('data-location'),
          label: btn.getAttribute('data-label')
        });
      });
    });

    // Document downloads
    document.querySelectorAll('[data-analytics="investors_doc_download"]').forEach(link => {
      link.addEventListener('click', () => {
        trackEvent('investors_doc_download', {
          doc: link.getAttribute('data-doc')
        });
      });
    });
  }

  // Track event (placeholder for analytics)
  function trackEvent(eventName, properties) {
    // Placeholder for analytics integration
    console.log('Analytics:', eventName, properties);
    // Example: gtag('event', eventName, properties);
    // Example: analytics.track(eventName, properties);
  }

})();

