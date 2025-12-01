// Initialize
const swiper = new Swiper('.swiper', {
  loop: true,
  speed: 500,                      // slide transition speed
  grabCursor: true,                // nice pointer feedback
  centeredSlides: true,
  watchSlidesProgress: true,

  // Autoplay that pauses on hover and regains on leave
  autoplay: {
    delay: 3000,
    disableOnInteraction: false
  },

  // Pagination bullets
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },

  // Prev/Next arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },

  // Keyboard access
  keyboard: {
    enabled: true,
    onlyInViewport: true
  },

  // Responsive breakpoints (optional)
  breakpoints: {
    0:   { slidesPerView: 1, spaceBetween: 0 },
    640: { slidesPerView: 1, spaceBetween: 0 },
    1024:{ slidesPerView: 1, spaceBetween: 0 }
  }
});

// Pause on hover (nice touch for autoplay)
const el = document.querySelector('.swiper');
el.addEventListener('mouseenter', () => swiper.autoplay.stop());
el.addEventListener('mouseleave', () => swiper.autoplay.start());