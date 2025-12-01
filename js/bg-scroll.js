/* ============= Dynamic Background Controller ============= */
(function() {
  const bgLayerProcess = document.getElementById('bg-layer-process');
  const bgLayerTech = document.getElementById('bg-layer-tech');
  const processSection = document.getElementById('company-intro');
  const techSection = document.getElementById('technology');

  if (!bgLayerProcess || !bgLayerTech || !processSection || !techSection) return;

  const observerOptions = {
    threshold: [0, 0.1, 0.5, 1.0], // Check at various points
    rootMargin: "-10% 0px -10% 0px" // Shrink effective viewport to focus on center interaction
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === processSection) {
        if (entry.isIntersecting) {
          bgLayerProcess.classList.add('active');
        } else {
          bgLayerProcess.classList.remove('active');
        }
      }
      
      if (entry.target === techSection) {
        if (entry.isIntersecting) {
          bgLayerTech.classList.add('active');
        } else {
          bgLayerTech.classList.remove('active');
        }
      }
    });
  }, observerOptions);

  observer.observe(processSection);
  observer.observe(techSection);
})();

