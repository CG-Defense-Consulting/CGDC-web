/* ============= Partners Carousel ============= */
(function() {
  const container = document.querySelector('.partners-carousel-container');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const cards = Array.from(track.querySelectorAll('.carousel-card'));
  const prevBtn = container.querySelector('.prev-arrow');
  const nextBtn = container.querySelector('.next-arrow');
  
  let currentIndex = 0;
  
  // Initialize positions
  updateCarousel();
  
  function updateCarousel() {
    cards.forEach(c => {
      c.classList.remove('active', 'prev', 'next');
      c.style.zIndex = '0';
      c.style.pointerEvents = 'none';
      // Reset styles that might interfere
      c.onclick = null;
    });
    
    const count = cards.length;
    const prevIndex = (currentIndex - 1 + count) % count;
    const nextIndex = (currentIndex + 1) % count;
    
    // Active card (Center)
    const activeCard = cards[currentIndex];
    activeCard.classList.add('active');
    activeCard.style.zIndex = '10';
    activeCard.style.pointerEvents = 'auto';
    
    // Prev card (Left)
    const prevCard = cards[prevIndex];
    prevCard.classList.add('prev');
    prevCard.style.zIndex = '5';
    prevCard.onclick = () => rotateTo(prevIndex); // Click to rotate
    prevCard.style.pointerEvents = 'auto'; // Allow clicking
    
    // Next card (Right)
    const nextCard = cards[nextIndex];
    nextCard.classList.add('next');
    nextCard.style.zIndex = '5';
    nextCard.onclick = () => rotateTo(nextIndex); // Click to rotate
    nextCard.style.pointerEvents = 'auto'; // Allow clicking
  }
  
  function rotateTo(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoRotate();
  }
  
  function nextCard() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }
  
  function prevCard() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevCard();
      resetAutoRotate();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextCard();
      resetAutoRotate();
    });
  }
  
  // Auto-rotate logic
  let autoRotateInterval;
  
  function startAutoRotate() {
    stopAutoRotate();
    autoRotateInterval = setInterval(nextCard, 5000);
  }
  
  function stopAutoRotate() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
  }
  
  function resetAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
  }
  
  // Start auto-rotation
  startAutoRotate();
  
  // Pause on hover over container
  container.addEventListener('mouseenter', stopAutoRotate);
  container.addEventListener('mouseleave', startAutoRotate);
  
  // --- Flashlight Effect Logic ---
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
  
})();