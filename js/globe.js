/* ============= Global Strategy 3D Globe ============= */
(function() {
  'use strict';

  // Coordinates (lat, lng) - Internal notes for tuning destinations
  const NYC_COORDS = { lat: 40.7128, lng: -74.0060 }; // New York City
  const NY_STATE_CENTER = { lat: 42.1657, lng: -74.9481 }; // New York State center
  
  // All 50 US States with approximate center coordinates
  const ALL_US_STATES = [
    { name: 'Alabama', lat: 32.806671, lng: -86.791130 },
    { name: 'Alaska', lat: 61.370716, lng: -152.404419 },
    { name: 'Arizona', lat: 33.729759, lng: -111.431221 },
    { name: 'Arkansas', lat: 34.969704, lng: -92.373123 },
    { name: 'California', lat: 36.116203, lng: -119.681564 },
    { name: 'Colorado', lat: 39.059811, lng: -105.311104 },
    { name: 'Connecticut', lat: 41.597782, lng: -72.755371 },
    { name: 'Delaware', lat: 39.318523, lng: -75.507141 },
    { name: 'Florida', lat: 27.766279, lng: -81.686783 },
    { name: 'Georgia', lat: 33.040619, lng: -83.643074 },
    { name: 'Hawaii', lat: 21.094318, lng: -157.498337 },
    { name: 'Idaho', lat: 44.240459, lng: -114.478828 },
    { name: 'Illinois', lat: 40.349457, lng: -88.986137 },
    { name: 'Indiana', lat: 39.849426, lng: -86.258278 },
    { name: 'Iowa', lat: 42.011539, lng: -93.210526 },
    { name: 'Kansas', lat: 38.526600, lng: -96.726486 },
    { name: 'Kentucky', lat: 37.668140, lng: -84.670067 },
    { name: 'Louisiana', lat: 31.169546, lng: -91.867805 },
    { name: 'Maine', lat: 44.323535, lng: -69.765261 },
    { name: 'Maryland', lat: 39.063946, lng: -76.802101 },
    { name: 'Massachusetts', lat: 42.230171, lng: -71.530106 },
    { name: 'Michigan', lat: 43.326618, lng: -84.536095 },
    { name: 'Minnesota', lat: 45.694454, lng: -93.900192 },
    { name: 'Mississippi', lat: 32.741646, lng: -89.678696 },
    { name: 'Missouri', lat: 38.456085, lng: -92.288368 },
    { name: 'Montana', lat: 46.921925, lng: -110.454353 },
    { name: 'Nebraska', lat: 41.125370, lng: -98.268082 },
    { name: 'Nevada', lat: 38.313515, lng: -117.055374 },
    { name: 'New Hampshire', lat: 43.452492, lng: -71.563896 },
    { name: 'New Jersey', lat: 40.298904, lng: -74.521011 },
    { name: 'New Mexico', lat: 34.840515, lng: -106.248482 },
    { name: 'New York', lat: 42.165726, lng: -74.948051 },
    { name: 'North Carolina', lat: 35.630066, lng: -79.806419 },
    { name: 'North Dakota', lat: 47.528912, lng: -99.784012 },
    { name: 'Ohio', lat: 40.388783, lng: -82.764915 },
    { name: 'Oklahoma', lat: 35.565342, lng: -96.928917 },
    { name: 'Oregon', lat: 44.572021, lng: -122.070938 },
    { name: 'Pennsylvania', lat: 40.590752, lng: -77.209755 },
    { name: 'Rhode Island', lat: 41.680893, lng: -71.51178 },
    { name: 'South Carolina', lat: 33.856892, lng: -80.945007 },
    { name: 'South Dakota', lat: 44.299782, lng: -99.438828 },
    { name: 'Tennessee', lat: 35.747845, lng: -86.692345 },
    { name: 'Texas', lat: 31.054487, lng: -97.563461 },
    { name: 'Utah', lat: 40.150032, lng: -111.862434 },
    { name: 'Vermont', lat: 44.26639, lng: -72.580536 },
    { name: 'Virginia', lat: 37.769337, lng: -78.169968 },
    { name: 'Washington', lat: 47.400902, lng: -121.490494 },
    { name: 'West Virginia', lat: 38.491226, lng: -80.954453 },
    { name: 'Wisconsin', lat: 44.268543, lng: -89.616508 },
    { name: 'Wyoming', lat: 41.145548, lng: -107.302490 }
  ];
  
  // Current random states for this animation cycle
  let currentCoordinateStates = [];
  let currentDeliverState = null;

  let globe = null;
  let isPaused = false;
  let isInitialized = false;
  let animationFrameId = null;
  let arcAnimationTimers = [];
  let countriesData = null;
  let usStatesData = null;
  let currentPhase = 'source'; // 'source', 'coordinate', 'deliver'
  let animationSequenceStarted = false;
  
  // Generate random coordinate states (2-6 states)
  function getRandomCoordinateStates() {
    const numStates = Math.floor(Math.random() * 5) + 2; // 2-6 states
    const shuffled = [...ALL_US_STATES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numStates);
  }
  
  // Generate random deliver state (1 state)
  function getRandomDeliverState() {
    const randomIndex = Math.floor(Math.random() * ALL_US_STATES.length);
    return ALL_US_STATES[randomIndex];
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load US states GeoJSON data
  async function loadUSStatesData() {
    if (usStatesData) return Promise.resolve();
    
    // Try multiple reliable sources
    const sources = [
      'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
      'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json',
      'https://raw.githubusercontent.com/geojson/geojson-rewind/master/test/data/us-states.geojson'
    ];
    
    for (const source of sources) {
      try {
        const response = await fetch(source);
        if (!response.ok) continue;
        const data = await response.json();
        // Check if it's a FeatureCollection with features array
        if (data.features && Array.isArray(data.features)) {
          usStatesData = data.features;
          return Promise.resolve();
        }
        // If it's already an array of features
        if (Array.isArray(data)) {
          usStatesData = data;
          return Promise.resolve();
        }
      } catch (error) {
        console.warn(`Failed to load from ${source}:`, error);
        continue;
      }
    }
    
    console.warn('Could not load US states data from any source');
    usStatesData = [];
    return Promise.resolve();
  }
  
  // Load country GeoJSON data (for world context)
  async function loadCountryData() {
    if (countriesData) return Promise.resolve();
    
    try {
      const response = await fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
      const data = await response.json();
      countriesData = data.features;
      return Promise.resolve();
    } catch (error) {
      console.warn('Could not load country data, using fallback:', error);
      countriesData = [];
      return Promise.resolve();
    }
  }

  // Create globe with US state outlines
  function createGlobeWithStates(container) {
    if (!container) {
      console.error('Cannot create globe: container missing');
      return;
    }

    try {
      // Combine US states and countries for full context
      const allPolygons = [...(usStatesData || []), ...(countriesData || [])];
      
      // Optimize: Cache US state names for faster lookup
      const usStateNames = new Set();
      if (usStatesData && usStatesData.length > 0) {
        usStatesData.forEach(state => {
          if (state.properties && state.properties.name) {
            usStateNames.add(state.properties.name);
          }
        });
      }
      
      // Track highlighted states for filling
      let highlightedStates = new Set();
      let stateColors = new Map();
      
      // Create globe instance with solid, opaque globe
      globe = Globe()
        .globeImageUrl(null) // No texture for clean vectorized look
        .backgroundImageUrl(null)
        .backgroundColor('#FFFFFF')
        .showAtmosphere(true)
        .atmosphereColor('#4A9EFF')
        .atmosphereAltitude(0.15)
        .polygonsData(allPolygons)
        .polygonCapColor((d) => {
          // Fill highlighted states with their colors, otherwise use solid white
          const stateName = d.properties && d.properties.name;
          if (stateName && highlightedStates.has(stateName)) {
            // Return the color for this state from the map
            return stateColors.get(stateName) || 'rgba(255, 255, 255, 0.95)';
          }
          return 'rgba(255, 255, 255, 0.95)'; // Solid white fill for opaque globe
        })
        .polygonSideColor(() => 'rgba(255, 255, 255, 0.9)') // Solid white sides
        .polygonStrokeColor((d) => {
          // US states get slightly bolder outlines (optimized lookup)
          const isUSState = d.properties && d.properties.name && usStateNames.has(d.properties.name);
          return isUSState ? 'rgba(74, 158, 255, 0.6)' : 'rgba(74, 158, 255, 0.3)';
        })
        .polygonAltitude(0.01) // Slight elevation for depth
        (container);
      
      // Store highlighted states set and color map on globe for access
      globe._highlightedStates = highlightedStates;
      globe._stateColors = stateColors;

      if (!globe) {
        console.error('Failed to create globe instance');
        return;
      }
    } catch (error) {
      console.error('Error creating globe:', error);
      return;
    }

    // Set white background on renderer and ensure proper sizing
    try {
      const renderer = globe.renderer();
      if (renderer) {
        renderer.setClearColor(0xFFFFFF, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // Cap at 2x for performance
        
        // Ensure renderer uses container dimensions
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        if (containerWidth > 0 && containerHeight > 0) {
          renderer.setSize(containerWidth, containerHeight);
          globe.width(containerWidth);
          globe.height(containerHeight);
        }
        
        // Configure canvas for proper display
        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.setAttribute('tabindex', '-1');
      }
    } catch (error) {
      console.warn('Could not configure renderer:', error);
    }

    // Initial camera position: Zoomed in on New York State (Source phase) - more zoomed in
    globe.pointOfView(
      { lat: NY_STATE_CENTER.lat, lng: NY_STATE_CENTER.lng, altitude: 0.4 },
      0 // Instant positioning
    );
    
    // Ensure controls are enabled
    try {
      const controls = globe.controls();
      if (controls) {
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.autoRotate = false; // No auto-rotate initially
        globe._controls = controls;
      }
    } catch (error) {
      console.warn('Could not configure controls:', error);
    }

    // Create NYC info card for Source phase (with error handling)
    createNYCCard();
    
    // Setup arc hover tooltips (with error handling)
    try {
      setupArcTooltips();
    } catch (error) {
      console.warn('Could not setup arc tooltips:', error);
    }
    
    // Setup scroll-triggered animation
    setupScrollAnimation();
    
    isInitialized = true;
    console.log('Globe initialized successfully');
  }

  // Initialize globe when section is near viewport
  function initGlobe() {
    if (isInitialized) return;
    
    // Check if Globe function is available
    if (typeof Globe === 'undefined') {
      console.error('Globe.gl library not loaded. Please check the script tag.');
      return;
    }
    
    const section = document.getElementById('global-strategy');
    if (!section) {
      console.warn('Global strategy section not found');
      return;
    }

    const container = document.getElementById('globe-container');
    if (!container) {
      console.warn('Globe container not found');
      return;
    }

    try {
      // Ensure container has dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('Globe container has no dimensions, retrying...');
        setTimeout(initGlobe, 100);
        return;
      }

      // Load US states data first, then initialize globe
      Promise.all([loadUSStatesData(), loadCountryData()])
        .then(() => {
          createGlobeWithStates(container);
        })
        .catch(err => {
          console.error('Failed to load geographic data:', err);
          // Fallback: create globe without outlines (still functional)
          createGlobeWithStates(container);
        });

    } catch (error) {
      console.error('Error initializing globe:', error);
    }
  }

  // Create glass info card anchored to NYC
  function createNYCCard() {
    const container = document.getElementById('globe-info-cards-container');
    if (!container) {
      console.warn('Cannot create NYC card: container not found');
      return;
    }

    // Remove any existing cards
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'globe-info-card';
    card.id = 'nyc-card';
    card.innerHTML = `
      <h3>Step 1: Analysis & Sourcing</h3>
      <p>Our global network identifies and coordinates defense procurement opportunities across strategic locations.</p>
    `;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Sourcing and Coordination information');
    
    container.appendChild(card);
    
    // Fade in
    setTimeout(() => {
      card.style.opacity = '1';
    }, 100);
  }

  // Create Coordinate phase info card
  function createCoordinateCard() {
    const container = document.getElementById('globe-info-cards-container');
    if (!container) {
      console.warn('Cannot create Coordinate card: container not found');
      return;
    }

    // Remove any existing cards
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'globe-info-card';
    card.id = 'coordinate-card';
    card.innerHTML = `
      <h3>Step 2: Smart Coordination</h3>
      <p>GUILD uses predictive analysis to use the most efficient production options</p>
    `;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Coordinate phase information');
    
    container.appendChild(card);
    
    // Fade in after a brief delay
    setTimeout(() => {
      card.style.opacity = '1';
    }, 200);
  }

  // Create Deliver phase info card
  function createDeliverCard() {
    const container = document.getElementById('globe-info-cards-container');
    if (!container) {
      console.warn('Cannot create Deliver card: container not found');
      return;
    }

    // Remove any existing cards
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'globe-info-card';
    card.id = 'deliver-card';
    card.innerHTML = `
      <h3>Step 3: Time Efficient Delivery</h3>
      <p>CG Defense Consulting provides the full end-to-end delivery in support of our defense readiness mission</p>
    `;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Deliver phase information');
    
    container.appendChild(card);
    
    // Fade in after a brief delay
    setTimeout(() => {
      card.style.opacity = '1';
    }, 200);
  }

  // Setup scroll-triggered animation sequence
  function setupScrollAnimation() {
    const section = document.getElementById('global-strategy');
    if (!section || !globe) {
      console.warn('Cannot setup scroll animation: section or globe missing');
      return;
    }

    // Check if section is already visible when globe is created
    const rect = section.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible && !animationSequenceStarted) {
      console.log('Section already visible, starting animation immediately');
      animationSequenceStarted = true;
      setTimeout(() => {
        if (globe && !isPaused) {
          startAnimationSequence();
        }
      }, 500); // Give globe time to fully render
    }

    // Also set up observer for when section becomes visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2 && !animationSequenceStarted && globe) {
          animationSequenceStarted = true;
          console.log('Section visible, starting animation sequence');
          // Small delay to ensure globe is fully rendered
          setTimeout(() => {
            if (globe && !isPaused) {
              startAnimationSequence();
            }
          }, 500);
        }
      });
    }, {
      threshold: [0.2, 0.3, 0.5],
      rootMargin: '100px'
    });

    observer.observe(section);
  }

  // Start the three-phase animation sequence
  function startAnimationSequence() {
    console.log('startAnimationSequence called', { isPaused, prefersReducedMotion, globe: !!globe });
    
    if (isPaused || prefersReducedMotion) {
      console.log('Animation paused or reduced motion, setting up static globe');
      setupStaticGlobe();
      return;
    }

    if (!globe) {
      console.warn('Globe not initialized, cannot start animation');
      return;
    }

    // Generate random states for this animation cycle
    currentCoordinateStates = getRandomCoordinateStates();
    currentDeliverState = getRandomDeliverState();
    console.log('Random coordinate states:', currentCoordinateStates.map(s => s.name));
    console.log('Random deliver state:', currentDeliverState.name);

    console.log('Starting animation sequence - Phase 1: Source');
    
    // Phase 1: Source (already zoomed in on NY State)
    currentPhase = 'source';
    updateLegendPhase('source');
    
    // Wait 2 seconds, then fade out Source card and transition to Coordinate phase
    setTimeout(() => {
      if (!isPaused && globe) {
        // Fade out Source card
        const sourceCard = document.getElementById('nyc-card');
        if (sourceCard) {
          sourceCard.style.transition = 'opacity 0.5s ease-out';
          sourceCard.style.opacity = '0';
        }
        
        // Wait for fade out, then transition
        setTimeout(() => {
          if (!isPaused && globe) {
            console.log('Transitioning to Coordinate phase');
            transitionToCoordinatePhase();
          }
        }, 500);
      } else {
        console.warn('Cannot transition: isPaused =', isPaused, 'globe =', !!globe);
      }
    }, 2000);
  }

  // Transition to Coordinate phase: Highlight states in blue, draw lines from NYC
  function transitionToCoordinatePhase() {
    console.log('transitionToCoordinatePhase called', { isPaused, globe: !!globe });
    
    if (isPaused || !globe) {
      console.warn('Cannot transition to coordinate: isPaused =', isPaused, 'globe =', !!globe);
      return;
    }
    
    currentPhase = 'coordinate';
    updateLegendPhase('coordinate');
    console.log('Updated phase to coordinate');

    // Zoom out to show US region - more zoomed in (slower transition)
    console.log('Zooming out to US center');
    globe.pointOfView(
      { lat: 39.8283, lng: -98.5795, altitude: 1.4 }, // Center of US - more zoomed in
      5000 // Slower transition - 5 seconds
    );

    // Create Coordinate phase info card after zoom
    setTimeout(() => {
      createCoordinateCard();
    }, 5000); // Wait for camera transition to complete
    
    // Highlight coordinate states in blue and draw arcs
    setTimeout(() => {
      if (isPaused || !globe) {
        console.warn('Skipping coordinate highlights: isPaused =', isPaused, 'globe =', !!globe);
        return;
      }
      console.log('Highlighting coordinate states and animating arcs');
      fillStatesWithColor(currentCoordinateStates, '#4A9EFF'); // Blue fill
      highlightStates(currentCoordinateStates, '#4A9EFF'); // Blue highlight points
      animateCoordinateArcs();
      
      // After all coordinate arcs are drawn, fade out Coordinate card and transition to Deliver
      const numStates = currentCoordinateStates.length;
      const arcDuration = numStates * 400; // Time for all arcs to animate
      setTimeout(() => {
        if (!isPaused && globe) {
          // Fade out Coordinate card
          const coordinateCard = document.getElementById('coordinate-card');
          if (coordinateCard) {
            coordinateCard.style.opacity = '0';
          }
          
          // Wait for fade out, then transition
          setTimeout(() => {
            if (!isPaused && globe) {
              console.log('Transitioning to Deliver phase');
              transitionToDeliverPhase();
            }
          }, 500);
        } else {
          console.warn('Cannot transition to deliver: isPaused =', isPaused, 'globe =', !!globe);
        }
      }, arcDuration + 3000); // Arcs duration + 3 seconds to see them
    }, 5000); // Wait for camera transition to complete
  }

  // Transition to Deliver phase: Lines from coordinate states to deliver state
  function transitionToDeliverPhase() {
    console.log('transitionToDeliverPhase called', { isPaused, globe: !!globe });
    
    if (isPaused || !globe) {
      console.warn('Cannot transition to deliver: isPaused =', isPaused, 'globe =', !!globe);
      return;
    }
    
    currentPhase = 'deliver';
    updateLegendPhase('deliver');
    console.log('Updated phase to deliver');

    // Create Deliver phase info card
    createDeliverCard();

    // Highlight deliver state in green
    fillStatesWithColor([currentDeliverState], '#10B981'); // Green fill
    highlightStates([currentDeliverState], '#10B981'); // Green highlight

    // Clear coordinate arcs before drawing deliver arcs
    setTimeout(() => {
      if (isPaused || !globe) {
        console.warn('Skipping deliver arcs: isPaused =', isPaused, 'globe =', !!globe);
        return;
      }
      // Clear previous arcs
      globe.arcsData([]);
      console.log('Cleared previous arcs, starting deliver arcs');
      
      // Small delay before drawing deliver arcs
      setTimeout(() => {
        if (!isPaused && globe) {
          animateDeliverArcs();
        } else {
          console.warn('Cannot animate deliver arcs: isPaused =', isPaused, 'globe =', !!globe);
        }
      }, 300);
    }, 500);
  }

  // Fill states with color by updating polygon fill
  function fillStatesWithColor(states, color) {
    if (!globe || !states || states.length === 0) {
      console.warn('Cannot fill states: missing globe or states');
      return;
    }
    
    try {
      const highlightedStates = globe._highlightedStates;
      const stateColors = globe._stateColors;
      
      if (!highlightedStates || !stateColors) {
        console.warn('Highlighted states set or color map not found');
        return;
      }
      
      // Mark states as highlighted and store their colors
      states.forEach(state => {
        highlightedStates.add(state.name);
        stateColors.set(state.name, color);
      });
      
      // Update polygon cap color function to use the stored colors
      globe.polygonCapColor((d) => {
        const stateName = d.properties && d.properties.name;
        if (stateName && highlightedStates.has(stateName)) {
          // Get color from map
          return stateColors.get(stateName) || color;
        }
        return 'rgba(255, 255, 255, 0.95)'; // Solid white for non-highlighted
      });
    } catch (error) {
      console.warn('Error filling states with color:', error);
    }
  }

  // Highlight states by adding markers/points
  function highlightStates(states, color) {
    if (!globe || !states || states.length === 0) {
      console.warn('Cannot highlight states: missing globe or states');
      return;
    }
    
    try {
      // Get existing points or start fresh
      const existingPoints = globe.pointsData() || [];
      const newPoints = states.map(state => ({
        lat: state.lat,
        lng: state.lng,
        color: color,
        size: 0.12
      }));
      
      // Combine existing and new points
      const allPoints = [...existingPoints, ...newPoints];

      globe.pointsData(allPoints)
        .pointLat(d => d.lat)
        .pointLng(d => d.lng)
        .pointColor(d => d.color)
        .pointRadius(d => d.size)
        .pointAltitude(0.01);
    } catch (error) {
      console.warn('Error highlighting states:', error);
    }
  }

  // Animate arcs from NYC to coordinate states
  function animateCoordinateArcs() {
    if (isPaused || !globe) return;

    const arcs = currentCoordinateStates.map((state, index) => ({
      startLat: NYC_COORDS.lat,
      startLng: NYC_COORDS.lng,
      endLat: state.lat,
      endLng: state.lng,
      color: ['#4A9EFF', '#60A5FA'], // Blue gradient
      state: state.name
    }));

    // Clear any existing arcs first
    globe.arcsData([]);

    // Sequence arcs with delays
    arcs.forEach((arc, index) => {
      const timer = setTimeout(() => {
        if (!isPaused && globe) {
          addArc(arc, index);
        }
      }, index * 400); // 400ms between each arc
      
      arcAnimationTimers.push(timer);
    });
    
    console.log('Coordinate phase arcs animation started');
  }

  // Animate arcs from coordinate states to deliver state
  function animateDeliverArcs() {
    if (isPaused || !globe) return;

    const arcs = currentCoordinateStates.map((state, index) => ({
      startLat: state.lat,
      startLng: state.lng,
      endLat: currentDeliverState.lat,
      endLng: currentDeliverState.lng,
      color: ['#10B981', '#34D399'], // Green gradient
      state: currentDeliverState.name
    }));

    // Sequence arcs with delays
    arcs.forEach((arc, index) => {
      const timer = setTimeout(() => {
        if (!isPaused && globe) {
          addArc(arc, index);
        }
      }, index * 300); // 300ms between each arc
      
      arcAnimationTimers.push(timer);
    });
    
    // Log completion
    console.log('Deliver phase animation started');
    
    // After all deliver arcs are drawn, wait a bit then loop back to start
    const numStates = currentCoordinateStates.length;
    const arcDuration = numStates * 300; // Time for all arcs to animate
    setTimeout(() => {
      if (!isPaused && globe) {
        console.log('Deliver phase complete, looping back to start');
        // Wait 10 seconds to show the final state, then reset and loop
        setTimeout(() => {
          if (!isPaused && globe) {
            resetAndLoopAnimation();
          }
        }, 10000); // 10 seconds to see the final deliver state
      }
    }, arcDuration);
  }
  
  // Reset animation state and loop back to start
  function resetAndLoopAnimation() {
    if (isPaused || !globe) return;
    
    console.log('Resetting animation and looping back to start');
    
    // Clear all arcs
    globe.arcsData([]);
    
    // Clear all highlighted states and colors
    const highlightedStates = globe._highlightedStates;
    const stateColors = globe._stateColors;
    if (highlightedStates) {
      highlightedStates.clear();
    }
    if (stateColors) {
      stateColors.clear();
    }
    
    // Reset polygon colors to default (white)
    globe.polygonCapColor(() => 'rgba(255, 255, 255, 0.95)');
    
    // Clear all points
    globe.pointsData([]);
    
    // Fade out Deliver card
    const deliverCard = document.getElementById('deliver-card');
    if (deliverCard) {
      deliverCard.style.opacity = '0';
    }
    
    // Reset camera to initial position (zoomed in on NY State) - slower transition
    globe.pointOfView(
      { lat: NY_STATE_CENTER.lat, lng: NY_STATE_CENTER.lng, altitude: 0.4 },
      5000 // Slower transition - 5 seconds
    );
    
    // Reset animation sequence flag so it can start again
    animationSequenceStarted = false;
    currentPhase = 'source';
    updateLegendPhase('source');
    
    // Wait for camera to reset, then start animation again
    setTimeout(() => {
      if (!isPaused && globe) {
        console.log('Restarting animation sequence');
        startAnimationSequence();
      }
    }, 5500); // Wait for camera transition to complete
  }


  // Add individual arc
  function addArc(arcData, index) {
    if (!globe || isPaused) return;
    
    const currentArcs = globe.arcsData() || [];
    
    try {
      globe.arcsData([...currentArcs, arcData])
        .arcStartLat(d => d.startLat)
        .arcStartLng(d => d.startLng)
        .arcEndLat(d => d.endLat)
        .arcEndLng(d => d.endLng)
        .arcColor(d => d.color)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2000)
        .arcStroke(2)
        .arcAltitude(d => {
          // Auto-scale altitude with great-circle distance
          const distance = getGreatCircleDistance(
            d.startLat, d.startLng,
            d.endLat, d.endLng
          );
          return Math.min(distance / 400, 0.3); // Scale to reasonable altitude
        });
    } catch (error) {
      console.warn('Error adding arc:', error);
    }
  }

  // Setup arc hover tooltips (called once during globe initialization)
  function setupArcTooltips() {
    if (!globe) {
      console.warn('Cannot setup arc tooltips: globe not initialized');
      return;
    }
    
    try {
      // Add hover tooltip for arcs
      if (typeof globe.onArcHover === 'function') {
        globe.onArcHover((arc, prevArc) => {
          if (arc && arc.state) {
            document.body.style.cursor = 'pointer';
            // Create or update tooltip
            let tooltip = document.getElementById('arc-tooltip');
            if (!tooltip) {
              tooltip = document.createElement('div');
              tooltip.id = 'arc-tooltip';
              tooltip.className = 'arc-tooltip';
              tooltip.setAttribute('role', 'tooltip');
              document.body.appendChild(tooltip);
            }
            tooltip.textContent = arc.state;
            tooltip.style.display = 'block';
          } else {
            document.body.style.cursor = 'default';
            const tooltip = document.getElementById('arc-tooltip');
            if (tooltip) {
              tooltip.style.display = 'none';
            }
          }
        });
        
        // Track mouse for tooltip positioning
        const renderer = globe.renderer();
        if (renderer && renderer.domElement) {
          const canvas = renderer.domElement;
          canvas.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('arc-tooltip');
            if (tooltip && tooltip.style.display === 'block') {
              tooltip.style.left = (e.clientX + 10) + 'px';
              tooltip.style.top = (e.clientY - 10) + 'px';
            }
          });
        }
      } else {
        console.warn('globe.onArcHover is not available');
      }
    } catch (error) {
      console.warn('Error setting up arc tooltips:', error);
    }
  }

  // Calculate great circle distance
  function getGreatCircleDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Create ping ripple at NYC
  function createNYCRipple() {
    if (isPaused || prefersReducedMotion) return;

    globe.ringsData([NYC_COORDS])
      .ringLat(d => d.lat)
      .ringLng(d => d.lng)
      .ringAltitude(0.01)
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(2000)
      .ringColor(() => '#4A9EFF')
      .ringResolution(64);
  }

  // Update legend phase indicator
  function updateLegendPhase(phase) {
    const phases = ['source', 'coordinate', 'deliver'];
    phases.forEach((p) => {
      const item = document.querySelector(`[data-phase="${p}"]`);
      if (item) {
        const dot = item.querySelector('.legend-dot');
        if (p === phase) {
          dot.classList.add('active');
          item.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          item.removeAttribute('aria-current');
        }
      }
    });
  }

  // Setup static globe for reduced motion
  function setupStaticGlobe() {
    // Generate random states for static view
    const staticCoordinateStates = getRandomCoordinateStates();
    const staticDeliverState = getRandomDeliverState();
    
    // Show NYC card permanently
    const card = document.getElementById('nyc-card');
    if (card) {
      card.style.opacity = '1';
    }

    // No rotation, no animations
    if (globe && globe.controls()) {
      globe.controls().autoRotate = false;
      globe.controls().enableRotate = false;
    }
    
    // Zoom to show US region - more zoomed in
    globe.pointOfView(
      { lat: 39.8283, lng: -98.5795, altitude: 1.4 },
      0
    );
    
    // Fill and highlight all states
    fillStatesWithColor(staticCoordinateStates, '#4A9EFF'); // Blue fill
    fillStatesWithColor([staticDeliverState], '#10B981'); // Green fill
    highlightStates(staticCoordinateStates, '#4A9EFF'); // Blue
    highlightStates([staticDeliverState], '#10B981'); // Green
    
    // Disable arc animations
    globe.arcDashAnimateTime(0);
    
    // Show all arcs immediately without animation (static view)
    const coordinateArcs = staticCoordinateStates.map((state) => ({
      startLat: NYC_COORDS.lat,
      startLng: NYC_COORDS.lng,
      endLat: state.lat,
      endLng: state.lng,
      color: ['#4A9EFF', '#60A5FA'],
      state: state.name
    }));
    
    const deliverArcs = staticCoordinateStates.map((state) => ({
      startLat: state.lat,
      startLng: state.lng,
      endLat: staticDeliverState.lat,
      endLng: staticDeliverState.lng,
      color: ['#10B981', '#34D399'],
      state: staticDeliverState.name
    }));
    
    const arcs = [...coordinateArcs, ...deliverArcs];
    
    globe.arcsData(arcs)
      .arcStartLat(d => d.startLat)
      .arcStartLng(d => d.startLng)
      .arcEndLat(d => d.endLat)
      .arcEndLng(d => d.endLng)
      .arcColor(d => d.color)
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(0) // No animation
      .arcStroke(2)
      .arcAltitude(d => {
        const distance = getGreatCircleDistance(
          d.startLat, d.startLng,
          d.endLat, d.endLng
        );
        return Math.min(distance / 400, 0.3);
      });
  }

  // Pause motion toggle - REMOVED: No pause button functionality
  // Function kept for compatibility but does nothing
  function togglePause() {
    // Pause functionality removed - animation always runs
  }

  // Lazy initialization with Intersection Observer
  function setupLazyInit() {
    const section = document.getElementById('global-strategy');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isInitialized) {
          initGlobe();
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px' // Start loading when section is 200px away
    });

    observer.observe(section);
  }

  // Handle window resize
  function handleResize() {
    if (globe) {
      const container = document.getElementById('globe-container');
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        // Use actual container dimensions
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        // Update globe dimensions
        globe.width(width);
        globe.height(height);
        
        // Update renderer size to match
        try {
          const renderer = globe.renderer();
          if (renderer) {
            renderer.setSize(width, height);
            // Ensure canvas fills container
            const canvas = renderer.domElement;
            if (canvas) {
              canvas.style.width = width + 'px';
              canvas.style.height = height + 'px';
            }
          }
        } catch (error) {
          console.warn('Error resizing renderer:', error);
        }
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupLazyInit();
      
      // Setup pause button
      // Pause button removed - no longer needed

      // Setup resize handler
      window.addEventListener('resize', handleResize);
    });
  } else {
    setupLazyInit();
    
    // Pause button removed - no longer needed

    window.addEventListener('resize', handleResize);
  }
})();

