document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.focus-btn');
  const progressBars = document.querySelectorAll('.focus-btn .progress');
  const slider = document.querySelector('.focus-slider');
  const totalSlides = document.querySelectorAll('.focus-slide').length;

  let currentIndex = 0;
  let intervalTime = 6000;
  let progressInterval;

  function updateSlide(index) {
    slider.style.transform = `translateX(-${index * 100}%)`;

    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
      progressBars[i].style.width = i === index ? '0%' : '0%';
    });

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
        let nextIndex = (index + 1) % totalSlides;
        updateSlide(nextIndex);
      }
      progressBars[index].style.width = `${width}%`;
    }, interval);
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      clearInterval(progressInterval);
      updateSlide(i);
    });
  });

  updateSlide(0);
});
