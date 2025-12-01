(function() {
  'use strict';

  // Configuration
  const REGIONS = {
    US: { latMin: 30, latMax: 48, lngMin: -115, lngMax: -75 },
    EU: { latMin: 42, latMax: 52, lngMin: -5, lngMax: 15 }, // Western Europe (France, Germany, etc.)
    TR: { latMin: 37, latMax: 41, lngMin: 27, lngMax: 43 }
  };

  // Explicit Start Point (New York / Northeast US)
  const START_POINT = { lat: 40.7128, lng: -74.0060, region: 'US', id: 'source' };

  const COLORS = {
    bg: '#0B0D11',
    atmosphere: '#4DD6FF',
    polygonSide: 'rgba(77,214,255,0.08)',
    polygonStroke: 'rgba(77,214,255,0.35)',
    polygonCap: 'rgba(255,255,255,0.06)',
    arc: '#F37514', // Orange for contrast/brand
    arcHead: '#FFFFFF',
    icon: '#4DD6FF' // Cyan for tech feel
  };

  // Constants
  const VIEW_ALTITUDE = 1.3;    // Distance to see full globe
  const MOVE_DURATION = 4000;   // Slower animation speed
  const STEP_1_WAIT = 8000;     // Reduced initial wait (8s)
  const STEP_PAUSE = 12000;     // Standard wait between other steps

  let globe;
  let currentCycle = {
    step: 0, // 0: idle, 1: p1, 2: p2, 3: p3
    p1: null,
    p2: null,
    p3: null,
    arcs: [],
    points: [],
    icons: []
  };

  // Utils
  function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getRandomRegionKey(options) {
    return options[Math.floor(Math.random() * options.length)];
  }

  function getRandomPoint(regionKey) {
    const r = REGIONS[regionKey];
    if (!r) return { lat: 0, lng: 0 };
    return {
      lat: randomFloat(r.latMin, r.latMax),
      lng: randomFloat(r.lngMin, r.lngMax),
      region: regionKey,
      id: Math.random().toString(36).substr(2, 9)
    };
  }

  // Update Left Side UI
  function updateUI(step) {
    const legendItems = document.querySelectorAll('.legend-item');
    const dots = document.querySelectorAll('.legend-dot');
    const descText = document.getElementById('phase-desc-text');
    
    if (!legendItems.length || !descText) return;

    // Reset dots
    dots.forEach(d => d.classList.remove('active'));

    // Texts
    const texts = {
      source: 'Intake, supplier validation, and early risk scoring start here.',
      coordinate: 'Predictive analysis is used to find the most efficient production options.',
      deliver: 'We provide the full end-to-end delivery in support of our defense readiness mission.'
    };

    if (step === 1) {
      const dot = document.querySelector('.legend-item[data-phase="source"] .legend-dot');
      if (dot) dot.classList.add('active');
      descText.innerHTML = `<span class="phase-body">${texts.source}</span>`;
    } else if (step === 2) {
      const dot = document.querySelector('.legend-item[data-phase="coordinate"] .legend-dot');
      if (dot) dot.classList.add('active');
      descText.innerHTML = `<span class="phase-body">${texts.coordinate}</span>`;
    } else if (step === 3) {
      const dot = document.querySelector('.legend-item[data-phase="deliver"] .legend-dot');
      if (dot) dot.classList.add('active');
      descText.innerHTML = `<span class="phase-body">${texts.deliver}</span>`;
    }
  }

  // Generate Icon Element (Cog, Factory, Box)
  function createIconElement(type) {
    const el = document.createElement('div');
    el.className = 'globe-icon';
    
    let svgContent = '';
    const strokeColor = COLORS.icon;

    if (type === 'cog') {
      // Settings Cog
      svgContent = `<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H15a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>`;
    } else if (type === 'factory') {
      // Factory
      svgContent = `<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>`;
    } else if (type === 'box') {
      // Box / Package
      svgContent = `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`;
    }

    el.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; filter: drop-shadow(0 0 8px ${COLORS.icon});">
        ${svgContent}
      </svg>
    `;

    // Add pulse effect styles dynamically if not present
    if (!document.getElementById('globe-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'globe-custom-styles';
      style.textContent = `
        .globe-icon {
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
        }
        .globe-icon.visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.2);
        }
      `;
      document.head.appendChild(style);
    }
    
    // Trigger animation after mount
    setTimeout(() => el.classList.add('visible'), 50);
    return el;
  }

  async function loadCountries() {
    try {
      const res = await fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
      const data = await res.json();
      return data.features || [];
    } catch (e) {
      console.warn('Country data failed', e);
      return [];
    }
  }

  // Main Cycle Logic
  async function runAnimationCycle() {
    if (!globe) return;

    // Reset Data
    currentCycle.arcs = [];
    currentCycle.points = [];
    currentCycle.icons = [];
    globe.arcsData([]).pointsData([]).htmlElementsData([]);

    // --- Step 1: Source (New York) ---
    // Animation: Just show the cog at start point. No line drawing.
    updateUI(1);
    const p1 = START_POINT;
    
    // Move Globe to P1
    globe.pointOfView({ lat: p1.lat, lng: p1.lng, altitude: VIEW_ALTITUDE }, MOVE_DURATION);
    await new Promise(r => setTimeout(r, MOVE_DURATION));

    // Show Cog Icon at P1
    currentCycle.icons = [{
      lat: p1.lat,
      lng: p1.lng,
      element: createIconElement('cog')
    }];
    globe.htmlElementsData(currentCycle.icons);

    await new Promise(r => setTimeout(r, STEP_1_WAIT)); // Pause at P1

    // --- Step 2: Coordinate (Europe/Turkey Cluster) ---
    // Animation: Pan to Europe, show random factories, connect with straight lines.
    updateUI(2);

    // Generate 7-8 random points in EU/Turkey
    const numFactories = Math.floor(randomFloat(7, 9)); // 7 or 8
    const factoryPoints = [];
    
    for (let i = 0; i < numFactories; i++) {
      // Pick region: Higher chance for EU to spread out, some TR
      const isTR = Math.random() > 0.7; 
      const region = isTR ? REGIONS.TR : REGIONS.EU;
      
      factoryPoints.push({
        lat: randomFloat(region.latMin, region.latMax),
        lng: randomFloat(region.lngMin, region.lngMax)
      });
    }

    // Move Globe to Center of Europe
    globe.pointOfView({ lat: 48, lng: 15, altitude: VIEW_ALTITUDE }, MOVE_DURATION);

    // Clear previous icon (Cog) as we pan
    currentCycle.icons = [];
    globe.htmlElementsData([]);

    await new Promise(r => setTimeout(r, MOVE_DURATION)); // Wait for pan

    // Show Factory Icons
    // Ensure minimum distance between points to prevent clutter
    // Simple rejection sampling
    const placedPoints = [];
    currentCycle.icons = [];
    
    for (let p of factoryPoints) {
      let tooClose = false;
      for (let existing of placedPoints) {
        // Simple euclidean distance check (good enough for local region)
        const dist = Math.sqrt(Math.pow(p.lat - existing.lat, 2) + Math.pow(p.lng - existing.lng, 2));
        if (dist < 4.0) { // Minimum distance in degrees (approx)
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        placedPoints.push(p);
        currentCycle.icons.push({
          lat: p.lat,
          lng: p.lng,
          element: createIconElement('factory')
        });
      }
    }
    // Update factoryPoints to only include the ones we actually placed
    // (Modifying the array for line drawing logic below)
    factoryPoints.length = 0;
    factoryPoints.push(...placedPoints);

    globe.htmlElementsData(currentCycle.icons);

    // Wait before drawing lines to ensure icons appear first
    await new Promise(r => setTimeout(r, 1000));

    // Connect factories with thin straight lines (random order)
    const factoryArcs = [];
    // Helper to shorten line so it stops at icon border
    // buffer degrees (approx 0.8 deg seems right for the icon size)
    const ARC_BUFFER = 0.8; 
    
    function getAdjustedArc(p1, p2) {
      const dLat = p2.lat - p1.lat;
      const dLng = p2.lng - p1.lng;
      const dist = Math.sqrt(dLat*dLat + dLng*dLng);
      
      if (dist <= ARC_BUFFER * 2) return null; // Too close to draw line
      
      const ratio = ARC_BUFFER / dist;
      
      return {
        startLat: p1.lat + dLat * ratio,
        startLng: p1.lng + dLng * ratio,
        endLat: p2.lat - dLat * ratio,
        endLng: p2.lng - dLng * ratio
      };
    }

    for (let i = 0; i < factoryPoints.length; i++) {
      // Connect to 1 or 2 other points randomly
      const numLinks = Math.floor(Math.random() * 2) + 1; 
      for (let k = 0; k < numLinks; k++) {
        const targetIdx = Math.floor(Math.random() * factoryPoints.length);
        if (targetIdx !== i) {
          const adjusted = getAdjustedArc(factoryPoints[i], factoryPoints[targetIdx]);
          if (adjusted) {
            factoryArcs.push({
              startLat: adjusted.startLat,
              startLng: adjusted.startLng,
              endLat: adjusted.endLat,
              endLng: adjusted.endLng,
              color: COLORS.icon, // Plain Blue line
              alt: 0.02, // Slightly raised
              dashLength: 1.0, 
              dashGap: 2.0,
              stroke: 0.5
            });
          }
        }
      }
    }
    
    currentCycle.arcs = factoryArcs;
    globe.arcsData(currentCycle.arcs);
    
    // Animate the "draw"
    // A longer time means slower draw
    globe.arcDashAnimateTime(3000);
    
    // Wait for lines to draw
    await new Promise(r => setTimeout(r, 3000));

    await new Promise(r => setTimeout(r, STEP_PAUSE));


    // --- Step 3: Deliver (Line to US) ---
    updateUI(3);
    
    // Pick a random start point from our factory cluster
    const p2 = factoryPoints[Math.floor(Math.random() * factoryPoints.length)];
    // Pick random US destination
    const p3 = getRandomPoint('US');
    // Ensure it's within US borders (approximate check)
    // Our REGIONS.US is already a bounding box, but let's double check or refine if needed.
    // REGIONS.US: { latMin: 30, latMax: 48, lngMin: -115, lngMax: -75 }
    // This is reasonably "within the United States borders" for a schematic.

    // Clear previous icons/lines
    currentCycle.icons = [];
    currentCycle.arcs = [];
    globe.htmlElementsData([]);
    globe.arcsData([]);

    // Draw single line to US
    const arcToUS = {
      startLat: p2.lat,
      startLng: p2.lng,
      endLat: p3.lat,
      endLng: p3.lng,
      color: [COLORS.arc, COLORS.arcHead],
      alt: 0.3, // Normal arc for long distance
      dashLength: 0.4, // Revert to dashed for the long flight
      dashGap: 0.1
    };
    
    currentCycle.arcs = [arcToUS];
    globe.arcsData(currentCycle.arcs);
    globe.arcDashAnimateTime(MOVE_DURATION);

    // Pan to US
    globe.pointOfView({ lat: p3.lat, lng: p3.lng, altitude: VIEW_ALTITUDE }, MOVE_DURATION);

    // Show Box Icon at P3 (arrival)
    setTimeout(() => {
      currentCycle.icons = [{
        lat: p3.lat,
        lng: p3.lng,
        element: createIconElement('box')
      }];
      globe.htmlElementsData(currentCycle.icons);
    }, MOVE_DURATION * 0.9);

    await new Promise(r => setTimeout(r, MOVE_DURATION));
    await new Promise(r => setTimeout(r, STEP_PAUSE));
    
    // Loop
    runAnimationCycle();
  }


  function init() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // Initialize Globe
    globe = Globe()(container)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .backgroundColor(COLORS.bg)
      .showAtmosphere(true)
      .atmosphereColor(COLORS.atmosphere)
      .atmosphereAltitude(0.15)
      // Polygons (Countries)
      .polygonCapColor(() => COLORS.polygonCap)
      .polygonSideColor(() => COLORS.polygonSide)
      .polygonStrokeColor(() => COLORS.polygonStroke)
      .polygonAltitude(() => 0.006)
      // Arcs (Lines)
      .arcColor('color')
      .arcStroke(d => d.stroke !== undefined ? d.stroke : 1.5) // Allow custom stroke width
      .arcAltitude(d => d.alt) // Allow custom altitude (0 for straight lines)
      .arcDashLength(d => d.dashLength !== undefined ? d.dashLength : 0.4)
      .arcDashGap(d => d.dashGap !== undefined ? d.dashGap : 0.1)
      .arcDashInitialGap(0)
      .arcDashAnimateTime(2000) // Default, overridden per step
      // Points (Destinations) - kept minimal/unused for icons
      .pointColor('color')
      .pointRadius('radius')
      .pointAltitude(0.02)
      // HTML Elements (Icons)
      .htmlElementsData([])
      .htmlElement(d => d.element);

    // Load Map Data
    loadCountries().then(features => {
      globe.polygonsData(features);
    });

    // Initial Config
    const renderer = globe.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    globe.controls().enableZoom = false; 
    globe.controls().autoRotate = false;
    globe.controls().enablePan = false;

    // Fix Alignment issues by forcing width/height matches
    function updateSize() {
      const { offsetWidth: w, offsetHeight: h } = container;
      globe.width(w);
      globe.height(h);
      renderer.setSize(w, h);
    }
    
    // Initial size update
    updateSize();

    // Handle Resize
    window.addEventListener('resize', () => {
      if(container && globe) {
        updateSize();
      }
    });

    // Start Loop
    runAnimationCycle();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
