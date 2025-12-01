(function() {
  'use strict';

  const bgLight = document.getElementById('bg-layer-light');
  if (!bgLight) return;

  function updateBackground() {
    // Calculate how far down the page the user has scrolled
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Prevent divide by zero
    if (docHeight <= 0) return;

    const scrollProgress = Math.min(1, Math.max(0, scrollY / docHeight));

    // Update opacity of the light layer
    // Map 0..1 scroll to 0..0.8 opacity (don't go fully opaque to keep some depth)
    const targetOpacity = scrollProgress * 0.8;
    
    bgLight.style.opacity = targetOpacity.toFixed(3);
  }

  // Listen for scroll events
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateBackground);
  }, { passive: true });

  // Initial check
  updateBackground();

})();

