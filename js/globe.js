/* ============= Our Process 3D Globe ============= */
(function() {
  'use strict';

  // ==================== COORDINATES ====================
  const NYC_COORDS = { lat: 40.7128, lng: -74.0060 };
  const ILLINOIS_COORDS = { lat: 40.349457, lng: -88.986137 };
  const PENNSYLVANIA_COORDS = { lat: 40.590752, lng: -77.1945 };
  const TURKEY_COORDS = { lat: 39.9334, lng: 32.8597 };
  const GERMANY_COORDS = { lat: 51.1657, lng: 10.4515 };

  // New state groups for animation sequences
  const STATE_GROUPS = {
    group1: [
    { name: 'California', lat: 36.116203, lng: -119.681564 },
    { name: 'North Carolina', lat: 35.630066, lng: -79.806419 },
      { name: 'Illinois', lat: 40.349457, lng: -88.986137 }
    ],
    group2: [
    { name: 'Texas', lat: 31.054487, lng: -97.563461 },
      { name: 'Nevada', lat: 38.313515, lng: -117.055374 },
      { name: 'Wisconsin', lat: 44.268543, lng: -89.616508 }
    ],
    group3: [
      { name: 'Arizona', lat: 33.729759, lng: -111.431221 },
      { name: 'Florida', lat: 27.766279, lng: -81.686783 },
      { name: 'South Carolina', lat: 33.856892, lng: -80.945007 }
    ]
  };

  const EUROPEAN_COUNTRIES = [
    { name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
    { name: 'Germany', lat: 51.1657, lng: 10.4515 },
    { name: 'Italy', lat: 41.8719, lng: 12.5674 },
    { name: 'Turkey', lat: 39.9334, lng: 32.8597 }
  ];

  // ==================== GLOBAL STATE ====================
  let globe = null;
  let isPaused = false;
  let countriesData = null;
  let usStatesData = null;
  let logoElement = null;

  // ==================== WEBGL DETECTION ====================
  function hasWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || 
                 canvas.getContext('experimental-webgl') ||
                 canvas.getContext('webgl2');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  // ==================== DATA LOADING ====================
  async function loadUSStatesData() {
    if (usStatesData) return Promise.resolve();
    
    const sources = [
      'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'
    ];
    
    for (const source of sources) {
      try {
        const response = await fetch(source);
        if (!response.ok) continue;
        const data = await response.json();
        if (data.features && Array.isArray(data.features)) {
          usStatesData = data.features;
          return Promise.resolve();
        }
        if (Array.isArray(data)) {
          usStatesData = data;
          return Promise.resolve();
        }
      } catch (error) {
        console.warn(`Failed to load from ${source}:`, error);
        continue;
      }
    }
    
    usStatesData = [];
    return Promise.resolve();
  }
  
  async function loadCountryData() {
    if (countriesData) return Promise.resolve();
    
    try {
      const response = await fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
      const data = await response.json();
      countriesData = data.features;
      return Promise.resolve();
    } catch (error) {
      console.warn('Could not load country data:', error);
      countriesData = [];
      return Promise.resolve();
    }
  }

  // ==================== FALLBACK UI ====================
  function showGlobeFallback(container) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
        <p>3D Globe visualization unavailable. Please enable WebGL in your browser.</p>
      </div>
    `;
  }

  // ==================== GLOBE CREATION ====================
  function createGlobe(container) {
    if (!container) {
      console.error('Container missing');
      return false;
    }

    if (!hasWebGLSupport()) {
      showGlobeFallback(container);
      return false;
    }

    const allPolygons = [...(usStatesData || []), ...(countriesData || [])];
    
    let highlightedPolygons = new Set();
    let polygonColors = new Map();
    
    try {
      globe = Globe()
        .globeImageUrl(null)
        .backgroundColor('#FFFFFF')
        .showAtmosphere(false)
        .showGlobe(true)
        .polygonsData(allPolygons)
        .polygonCapColor((d) => {
          const props = d.properties || {};
          const polygonName = props.name || props.NAME || props.NAME_EN || props.ADMIN || '';
          
          // Check various name variations
          for (const [name, color] of polygonColors.entries()) {
            if (polygonName.toLowerCase() === name.toLowerCase() ||
                polygonName.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(polygonName.toLowerCase())) {
              return color;
            }
          }
          return '#FFFFFF';
        })
        .polygonSideColor((d) => {
          const props = d.properties || {};
          const polygonName = props.name || props.NAME || props.NAME_EN || props.ADMIN || '';
          
          for (const [name, color] of polygonColors.entries()) {
            if (polygonName.toLowerCase() === name.toLowerCase() ||
                polygonName.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(polygonName.toLowerCase())) {
              return color;
            }
          }
          return '#FFFFFF';
        })
        .polygonStrokeColor(() => '#000000')
        .polygonAltitude(0.01)
        (container);
      
      globe._highlightedPolygons = highlightedPolygons;
      globe._polygonColors = polygonColors;
    } catch (error) {
      console.error('Error creating globe:', error);
      showGlobeFallback(container);
      return false;
    }

    // Configure renderer
    try {
      const renderer = globe.renderer();
      if (renderer) {
        renderer.setClearColor(0xFFFFFF, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        if (containerWidth > 0 && containerHeight > 0) {
          renderer.setSize(containerWidth, containerHeight);
          globe.width(containerWidth);
          globe.height(containerHeight);
        }
      }
    } catch (error) {
      console.warn('Could not configure renderer:', error);
    }

    // Initial camera position
    globe.pointOfView({ lat: NYC_COORDS.lat, lng: NYC_COORDS.lng, altitude: 0.3 }, 0);
    
    // Disable controls
    try {
      const controls = globe.controls();
      if (controls) {
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = false;
      }
    } catch (error) {
      console.warn('Could not configure controls:', error);
    }

    console.log('Globe initialized successfully');
    return true;
  }

  // ==================== CORE FUNCTIONS ====================
  
  function setCamera(lat, lng, altitude, duration = 0) {
    if (globe) {
      globe.pointOfView({ lat, lng, altitude }, duration);
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  }

  function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = c1.r + factor * (c2.r - c1.r);
    const g = c1.g + factor * (c2.g - c1.g);
    const b = c1.b + factor * (c2.b - c1.b);
    return rgbToHex(r, g, b);
  }

  function fillStates(stateNames, targetColor, duration = 1000) {
    if (!globe) return;
    console.log('Filling states:', stateNames, 'with color:', targetColor, 'duration:', duration);
    
    return new Promise((resolve) => {
      stateNames.forEach(name => {
        globe._highlightedPolygons.add(name);
        globe._polygonColors.set(name, '#FFFFFF'); // Start with white
      });
      
      const startTime = Date.now();
      
      function animateFade() {
        if (isPaused) {
          resolve();
        return;
      }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        stateNames.forEach(name => {
          const color = interpolateColor('#FFFFFF', targetColor, progress);
          globe._polygonColors.set(name, color);
        });
        
        // Trigger re-render
        globe.polygonCapColor(globe.polygonCapColor());
        globe.polygonSideColor(globe.polygonSideColor());
        
        if (progress < 1) {
          requestAnimationFrame(animateFade);
        } else {
          console.log('Fill animation complete');
          resolve();
        }
      }
      
      animateFade();
    });
  }

  function unfillStates(stateNames, duration = 1000) {
    if (!globe) return;
    console.log('Unfilling states:', stateNames, 'duration:', duration);
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      function animateFade() {
        if (isPaused) {
          // Complete the unfill immediately if paused
          stateNames.forEach(name => {
            globe._highlightedPolygons.delete(name);
            globe._polygonColors.delete(name);
          });
          resolve();
      return;
    }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        stateNames.forEach(name => {
          const currentColor = globe._polygonColors.get(name) || '#4A9EFF';
          const color = interpolateColor(currentColor, '#FFFFFF', progress);
          globe._polygonColors.set(name, color);
        });
        
        // Trigger re-render
        globe.polygonCapColor(globe.polygonCapColor());
        globe.polygonSideColor(globe.polygonSideColor());
        
        if (progress < 1) {
          requestAnimationFrame(animateFade);
        } else {
          stateNames.forEach(name => {
            globe._highlightedPolygons.delete(name);
            globe._polygonColors.delete(name);
          });
          console.log('Unfill animation complete');
          resolve();
        }
      }
      
      animateFade();
    });
  }

  function createFullyConnectedGraph(locations) {
    const arcs = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        arcs.push({
          startLat: locations[i].lat,
          startLng: locations[i].lng,
          endLat: locations[j].lat,
          endLng: locations[j].lng,
          color: '#000000'
        });
      }
    }
    return arcs;
  }

  function drawDottedLines(locations, color = '#000000', duration = 1500) {
    if (!globe) return;
    console.log('Drawing dotted lines for locations:', locations);
    
    return new Promise((resolve) => {
      const arcs = createFullyConnectedGraph(locations);
      console.log('Created arcs:', arcs);
      
      // Store the original endpoints
      arcs.forEach(arc => {
        arc.originalEndLat = arc.endLat;
        arc.originalEndLng = arc.endLng;
        arc.endLat = arc.startLat; // Start with zero length
        arc.endLng = arc.startLng;
        arc.progress = 0;
      });
      
      globe.arcsData(arcs)
        .arcColor(d => d.color)
        .arcStroke(0.8)
        .arcAltitude(0.05)
        .arcDashLength(0.2)
        .arcDashGap(0.15)
        .arcDashAnimateTime(0);
      
      const startTime = Date.now();
      
      function animateGrowth() {
        if (isPaused) {
          resolve();
      return;
    }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        arcs.forEach(arc => {
          arc.endLat = arc.startLat + progress * (arc.originalEndLat - arc.startLat);
          arc.endLng = arc.startLng + progress * (arc.originalEndLng - arc.startLng);
          arc.progress = progress;
        });
        
        globe.arcsData([...arcs]); // Force update
        
        if (progress < 1) {
          requestAnimationFrame(animateGrowth);
      } else {
          console.log('Line drawing complete');
          resolve();
        }
      }
      
      animateGrowth();
    });
  }

  function drawSpecificEdges(edges, duration = 1500) {
    if (!globe) return;
    console.log('Drawing specific edges:', edges);
    
    return new Promise((resolve) => {
      const arcs = edges.map(edge => {
        const from = EUROPEAN_COUNTRIES.find(c => c.name === edge[0]);
        const to = EUROPEAN_COUNTRIES.find(c => c.name === edge[1]);
        
        if (!from || !to) {
          console.warn('Could not find country for edge:', edge);
          return null;
        }
        
        return {
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
          originalEndLat: to.lat,
          originalEndLng: to.lng,
          color: '#000000',
          progress: 0
        };
      }).filter(Boolean);
      
      console.log('Created edge arcs:', arcs);
      
      // Start with zero-length arcs
      arcs.forEach(arc => {
        arc.endLat = arc.startLat;
        arc.endLng = arc.startLng;
      });
      
      globe.arcsData(arcs)
        .arcColor(d => d.color)
        .arcStroke(0.8)
        .arcAltitude(0.05)
        .arcDashLength(0.2)
        .arcDashGap(0.15)
        .arcDashAnimateTime(0);
      
      const startTime = Date.now();
      
      function animateGrowth() {
        if (isPaused) {
          resolve();
      return;
    }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        arcs.forEach(arc => {
          arc.endLat = arc.startLat + progress * (arc.originalEndLat - arc.startLat);
          arc.endLng = arc.startLng + progress * (arc.originalEndLng - arc.startLng);
          arc.progress = progress;
        });
        
        globe.arcsData([...arcs]); // Force update
        
        if (progress < 1) {
          requestAnimationFrame(animateGrowth);
        } else {
          console.log('Edge drawing complete');
          resolve();
        }
      }
      
      animateGrowth();
    });
  }

  function drawSolidLine(fromLoc, toLoc, color = '#10B981', arcAltitude = 0.05) {
    if (!globe) return;
    console.log('Drawing solid line from', fromLoc, 'to', toLoc);
    
    const currentArcs = globe.arcsData() || [];
    const newArc = {
      startLat: fromLoc.lat,
      startLng: fromLoc.lng,
      endLat: toLoc.lat,
      endLng: toLoc.lng,
      color: color,
      altitude: arcAltitude
    };
    
    globe.arcsData([...currentArcs, newArc])
      .arcColor(d => d.color)
      .arcStroke(1.2)
      .arcAltitude(d => d.altitude || 0.05)
      .arcDashLength(0)
      .arcDashGap(0)
      .arcDashAnimateTime(2000);
  }

  function clearArcs(animated = false, duration = 1500) {
    if (!globe) return;
    
    return new Promise((resolve) => {
      if (animated) {
        console.log('Animating arc retraction');
        const currentArcs = globe.arcsData() || [];
        
        if (currentArcs.length === 0) {
          globe.arcsData([]);
          resolve();
      return;
    }
    
        // Store original endpoints for retraction
        currentArcs.forEach(arc => {
          if (!arc.originalEndLat) {
            arc.originalEndLat = arc.endLat;
            arc.originalEndLng = arc.endLng;
          }
        });
        
        const startTime = Date.now();
        
        function animateRetraction() {
          if (isPaused) {
            globe.arcsData([]);
            resolve();
      return;
    }
    
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          currentArcs.forEach(arc => {
            // Retract from end back to start
            arc.endLat = arc.originalEndLat - progress * (arc.originalEndLat - arc.startLat);
            arc.endLng = arc.originalEndLng - progress * (arc.originalEndLng - arc.startLng);
          });
          
          globe.arcsData([...currentArcs]); // Force update
          
          if (progress < 1) {
            requestAnimationFrame(animateRetraction);
          } else {
            globe.arcsData([]);
            console.log('Arc retraction complete');
            resolve();
          }
        }
        
        animateRetraction();
        } else {
        console.log('Clearing arcs instantly');
        globe.arcsData([]);
        resolve();
      }
    });
  }

  // ==================== LOGO FUNCTIONS ====================
  
  function showLogo(scale = 1.0) {
    if (!globe) return;
    
    const logoDiv = document.createElement('div');
    logoDiv.className = 'cg-logo-overlay';
    logoDiv.style.cssText = `
      opacity: 0;
      transition: opacity 0.5s ease-in;
      width: ${120 * scale}px;
      height: auto;
      pointer-events: none;
    `;
    
    const logoImg = document.createElement('img');
    logoImg.src = 'images/CG-color.png';
    logoImg.alt = 'CG Defense Consulting';
    logoImg.style.cssText = `
      width: 100%;
      height: auto;
      opacity: 0.9;
      display: block;
    `;
    
    logoDiv.appendChild(logoImg);
    logoElement = logoDiv;
    
    globe.htmlElementsData([{
      lat: NYC_COORDS.lat,
      lng: NYC_COORDS.lng,
      html: logoDiv
    }]).htmlElement(d => d.html);
    
      setTimeout(() => {
      logoDiv.style.opacity = '1';
    }, 100);
  }

  function animateLogoSize(startScale, endScale, duration) {
    if (!logoElement) return;
    
    const startTime = Date.now();
    const startWidth = 120 * startScale;
    const endWidth = 120 * endScale;
    
    function animate() {
      if (isPaused || !logoElement) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentWidth = startWidth + (endWidth - startWidth) * progress;
      
      logoElement.style.width = `${currentWidth}px`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  }

  // ==================== ANIMATION SEQUENCE ====================
  
  function startAnimation() {
    if (isPaused) return;
    
    // Step 1: NYC with logo
    setCamera(NYC_COORDS.lat, NYC_COORDS.lng, 0.3);
    showLogo(1.0);
    
    setTimeout(() => {
      if (isPaused) return;
      
      // Step 2 & 3: Zoom to US, shrink logo
      setCamera(39.8283, -98.5795, 0.9, 3000);
      animateLogoSize(1.0, 0.3, 3000);
      
      setTimeout(() => runStateGroups(), 3000);
    }, 1000);
  }

  function runStateGroups() {
    if (isPaused) return;
    
    const groups = [STATE_GROUPS.group1, STATE_GROUPS.group2, STATE_GROUPS.group3];
    let index = 0;
    
    function processGroup() {
      if (isPaused) return;
      
      if (index >= groups.length) {
        setTimeout(() => transitionToEurope(), 500);
        return;
      }
      
      const states = groups[index];
      const stateNames = states.map(s => s.name);
      
      console.log('Processing state group:', stateNames);
      
      // Start fade in states (1500ms) and draw dotted lines in parallel
      const fillPromise = fillStates(stateNames, '#4A9EFF', 1500);
      const linePromise = drawDottedLines(states, '#000000', 1500);
      
      // Wait for both animations to complete
      Promise.all([fillPromise, linePromise]).then(() => {
        if (isPaused) return;
        
        // View for 2000ms
        setTimeout(() => {
          if (isPaused) return;
          
          // Retract lines and fade out states in parallel (both 1500ms)
          const unfillPromise = unfillStates(stateNames, 1500);
          const retractPromise = clearArcs(true, 1500);
          
          Promise.all([unfillPromise, retractPromise]).then(() => {
            index++;
            setTimeout(() => processGroup(), 500);
          });
        }, 2000);
      });
    }
    
    processGroup();
  }

  function transitionToEurope() {
    if (isPaused) return;
    
    setCamera(50, 15, 0.9, 3000);
    
    setTimeout(() => {
      if (isPaused) return;
      
      const countryNames = EUROPEAN_COUNTRIES.map(c => c.name);
      console.log('Filling European countries:', countryNames);
      
      // Fade in countries (1500ms)
      fillStates(countryNames, '#4A9EFF', 1500);
      
      // Start line animations after a brief delay
    setTimeout(() => {
        if (isPaused) return;
        runEuropeanLines();
      }, 500);
    }, 3000);
  }

  function runEuropeanLines() {
    if (isPaused) return;
    
    const edgeSets = [
      [['United Kingdom', 'Germany'], ['Germany', 'Turkey']],
      [['Germany', 'Italy'], ['Italy', 'Turkey']],
      [['United Kingdom', 'Turkey'], ['Turkey', 'Italy']]
    ];
    
    let index = 0;
    
    function processEdges() {
      if (isPaused) return;
      
      if (index >= edgeSets.length) {
        startDelivery();
      return;
    }
    
      drawSpecificEdges(edgeSets[index], 1500).then(() => {
        if (isPaused) return;
        
        // View for 1500ms
        setTimeout(() => {
          if (isPaused) return;
          
          clearArcs(true, 1500).then(() => {
            index++;
            setTimeout(() => processEdges(), 300);
          });
        }, 1500);
      });
    }
    
    processEdges();
  }

  function startDelivery() {
    if (isPaused) return;
    
    // Clear European fills with fade out (1500ms)
    const countryNames = EUROPEAN_COUNTRIES.map(c => c.name);
    unfillStates(countryNames, 1500).then(() => {
      if (isPaused) return;
      
      // Turkey to Germany
      drawSolidLine(TURKEY_COORDS, GERMANY_COORDS);
      continueDelivery();
    });
  }
  
  function continueDelivery() {
    
    setTimeout(() => {
      if (isPaused) return;
      
      // Germany to Illinois with pan (higher arc for visibility)
      drawSolidLine(GERMANY_COORDS, ILLINOIS_COORDS, '#10B981', 0.25);
      setCamera(ILLINOIS_COORDS.lat, ILLINOIS_COORDS.lng, 0.9, 2000);
      
      setTimeout(() => {
        if (isPaused) return;
        
        // Illinois to Pennsylvania
        drawSolidLine(ILLINOIS_COORDS, PENNSYLVANIA_COORDS);
        
    setTimeout(() => {
          if (isPaused) return;
          
          showCheckmark();
          setTimeout(() => resetToStart(), 1000);
        }, 0);
      }, 2000);
    }, 500);
  }

  function showCheckmark() {
    if (!globe) return;
    
    const checkmark = document.createElement('div');
    checkmark.innerHTML = '✓';
    checkmark.style.cssText = 'font-size: 48px; color: #10B981; font-weight: bold;';
    
    const existingElements = globe.htmlElementsData() || [];
    globe.htmlElementsData([...existingElements, {
      lat: PENNSYLVANIA_COORDS.lat,
      lng: PENNSYLVANIA_COORDS.lng,
      html: checkmark
    }]).htmlElement(d => d.html);
  }

  function resetToStart() {
    if (isPaused) return;
    
    clearArcs();
    globe.htmlElementsData([]);
    
    // Clear any remaining fills
    if (globe._highlightedPolygons) {
      globe._highlightedPolygons.clear();
    }
    if (globe._polygonColors) {
      globe._polygonColors.clear();
    }
    globe.polygonsData([...globe.polygonsData()]);
    
    startAnimation();
  }

  // ==================== PAUSE BUTTON ====================
  
  function setupPauseButton() {
    const pauseBtn = document.getElementById('globe-pause-btn');
    if (!pauseBtn) return;
    
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.classList.toggle('paused', isPaused);
      pauseBtn.innerHTML = isPaused ? 
        '<span class="pause-icon">▶</span> Resume' : 
        '<span class="pause-icon">⏸</span> Pause';
      
      if (!isPaused) {
        // Resume animation
        startAnimation();
      }
    });
  }

  // ==================== INITIALIZATION ====================
  
  async function initGlobe() {
    console.log('Initializing globe...');
    
    const container = document.getElementById('globe-container');
    if (!container) {
      console.error('Globe container not found');
      return;
    }

    // Load data
    await Promise.all([loadUSStatesData(), loadCountryData()]);
    
    // Create globe
    const success = createGlobe(container);
    if (!success) {
      console.error('Failed to create globe');
      return;
    }

    // Setup pause button
    setupPauseButton();

    // Start animation when section is visible
    const section = document.getElementById('global-strategy');
    if (!section) {
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setTimeout(() => {
            if (globe && !isPaused) {
              startAnimation();
            }
          }, 500);
          observer.disconnect();
        }
      });
    }, {
      threshold: [0.2, 0.3, 0.5],
      rootMargin: '100px'
    });

    observer.observe(section);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobe);
  } else {
    initGlobe();
  }

})();
