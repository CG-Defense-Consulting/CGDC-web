/* ============= Minimal Globe (slow rotation, country outlines only) ============= */
(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INITIAL_POV = { lat: 39.0, lng: 35.0, altitude: 0.9 }; // Centered over Turkey

  const SUPPLIERS = [
    { id: 'berlin', lat: 52.52, lng: 13.405 },
    { id: 'istanbul', lat: 41.0082, lng: 28.9784 },
    { id: 'paris', lat: 48.8566, lng: 2.3522 },
    { id: 'madrid', lat: 40.4168, lng: -3.7038 },
    { id: 'ankara', lat: 39.9334, lng: 32.8597 },
    { id: 'tirana', lat: 41.3275, lng: 19.8187 },
    { id: 'napoli', lat: 40.8518, lng: 14.2681 },
    { id: 'london', lat: 51.5074, lng: -0.1278 },
    { id: 'stockholm', lat: 59.3293, lng: 18.0686 },
    { id: 'marseille', lat: 43.2965, lng: 5.3698 },
    { id: 'munich', lat: 48.1351, lng: 11.5820 },
    { id: 'newyork', lat: 40.7128, lng: -74.0060 },
    { id: 'boston', lat: 42.3601, lng: -71.0589 },
    { id: 'santafe', lat: 35.6870, lng: -105.9378 },
    { id: 'losangeles', lat: 34.0522, lng: -118.2437 },
    { id: 'sandiego', lat: 32.7157, lng: -117.1611 },
    { id: 'chicago', lat: 41.8781, lng: -87.6298 },
    { id: 'tampa', lat: 27.9506, lng: -82.4572 },
    { id: 'alabama', lat: 32.3182, lng: -86.9023 }
  ];
  const SLICE_WIDTH_DEG = 5;       // total width of slice
  const ALT_MIN = 0.01;
  const ALT_MAX = 0.08;

  let globe;
  let currentLng = INITIAL_POV.lng;
  let currentLat = INITIAL_POV.lat;
  let currentAlt = INITIAL_POV.altitude;
  let animationId = null;
  let lastProgressLog = {};
  const ROTATE_SPEED_DEG = -9;
  let motionPaused = false;
  const STOP_LNG = -120; // stop once we’re over California

  function renderSliceGuide(){
    if(!globe) return;
    const arcs = SUPPLIERS.flatMap(node=>{
      const half = SLICE_WIDTH_DEG / 2;
      const west = node.lng - half;
      const east = node.lng + half;
      return [
        { startLat:-80, startLng:west, endLat:80, endLng:west, altitude:0.42 },
        { startLat:-80, startLng:east, endLat:80, endLng:east, altitude:0.42 }
      ];
    });
    // Disabled red slice guides for now
    // globe.arcsData(arcs)
    //   .arcStartLat(d=>d.startLat).arcStartLng(d=>d.startLng)
    //   .arcEndLat(d=>d.endLat).arcEndLng(d=>d.endLng)
    //   .arcAltitude(d=>d.altitude||0.04)
    //   .arcStroke(0.8)
    //   .arcDashLength(1)
    //   .arcDashGap(0)
    //   .arcColor(()=> ['rgba(255,80,80,0.7)','rgba(255,80,80,0.7)']);
  }

  async function loadCountries(){
    try{
      const res = await fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
      const data = await res.json();
      return data.features || [];
    }catch(e){
      console.warn('Country data failed', e);
      return [];
    }
  }

  function createGlobe(container){
    globe = Globe()(container)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .backgroundColor('#0B0D11')
      .showAtmosphere(true)
      .atmosphereColor('#4DD6FF')
      .atmosphereAltitude(0.18)
      .polygonsData([]);

    const renderer = globe.renderer();
    if(renderer){
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      const {offsetWidth:w, offsetHeight:h}=container;
      renderer.setSize(w,h); globe.width(w); globe.height(h);
    }

    globe.pointOfView(INITIAL_POV, 0);
    const controls = globe.controls();
    if(controls){
      controls.autoRotate = false; // user controls rotation
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.enableDamping = false;
    }

    // Tweak globe material for subtle dark styling
    try{
      const mat = globe.globeMaterial();
      mat.color = new THREE.Color('#070a12');
      mat.emissive = new THREE.Color('#070a12');
      mat.emissiveIntensity = 0.25;
    }catch(e){}
  }

  function renderSuppliers(nodesWithAlt){
    if(!globe) return;
    globe
      .pointsData(nodesWithAlt)
      .pointsTransitionDuration(0)
      .pointLat(d=>d.lat)
      .pointLng(d=>d.lng)
      .pointAltitude(d=>d.altitude || ALT_MIN)
      .pointRadius(()=>0.4)
      .pointColor(()=> '#4DD6FF');
  }

  function normalizeLng(lng){
    let x = (lng + 180) % 360;
    if (x < 0) x += 360;
    x -= 180;
    if (x > 180) x -= 360; // ensure in [-180,180]
    return x;
  }

  function getRotationAngle(){
    const pov = globe.pointOfView();
    currentLat = pov.lat;
    currentLng = normalizeLng(pov.lng);
    currentAlt = pov.altitude || currentAlt;
    // use normalized longitude as rotation angle baseline; wrap to [-180,180]
    return currentLng;
  }

  function getSupplierHeightForNode(nodeLng, logKey){
    const half = SLICE_WIDTH_DEG / 2;
    const eastEdgeRaw = nodeLng - half;
    const westEdgeRaw = nodeLng + half;
    const angle = normalizeLng(currentLng);
    const east = normalizeLng(eastEdgeRaw);
    const west = normalizeLng(westEdgeRaw);

    let progress = 0;
    if (west > east) {
      if (angle <= east) progress = 1;
      else if (angle >= west) progress = 0;
      else progress = 1 - ((angle - east) / (west - east));
    } else {
      const span = (360 - east) + west;
      const diff = angle >= east ? (angle - east) : (angle + 360 - east);
      const norm = Math.max(0, Math.min(1, diff / span));
      progress = 1 - norm;
    }
    const height = ALT_MIN + (ALT_MAX - ALT_MIN) * progress;
    if (Math.abs(progress - (lastProgressLog[logKey] || 0)) > 0.05) {
      console.log(`[${logKey}] angle:${angle.toFixed(2)} east:${east.toFixed(2)} west:${west.toFixed(2)} progress:${progress.toFixed(3)} height:${height.toFixed(3)}`);
      lastProgressLog[logKey] = progress;
    }
    return height;
  }

  function tick(ts){
    // pull current POV from controls/camera to drive the slice logic
    if(!motionPaused){
      const dt = ts && tick.prevTs ? (ts - tick.prevTs)/1000 : 0;
      tick.prevTs = ts;
      currentLng = normalizeLng(currentLng + ROTATE_SPEED_DEG * dt);
      if (currentLng <= STOP_LNG) {
        motionPaused = true;
      }
      globe.pointOfView({ lat: currentLat, lng: currentLng, altitude: currentAlt }, 0);
    } else {
      tick.prevTs = ts;
    }

    const angle = getRotationAngle();
    const nodesWithAlt = SUPPLIERS.map(node => ({
      ...node,
      altitude: getSupplierHeightForNode(node.lng, node.id)
    }));
    renderSuppliers(nodesWithAlt);

    animationId = requestAnimationFrame(tick);
  }

  function init(){
    const container = document.getElementById('globe-container');
    if(!container || !window.WebGLRenderingContext) return;

    createGlobe(container);

    loadCountries().then(features=>{
      if(!features.length) return;
      globe
        .polygonsData(features)
        .polygonCapColor(()=> 'rgba(255,255,255,0.06)')
        .polygonSideColor(()=> 'rgba(77,214,255,0.08)')
        .polygonStrokeColor(()=> 'rgba(77,214,255,0.35)')
        .polygonAltitude(()=>0.006);
    });

    getRotationAngle(); // update currentLng/lat
    const nodesWithAlt = SUPPLIERS.map(node => ({
      ...node,
      altitude: getSupplierHeightForNode(node.lng, node.id)
    }));
    renderSuppliers(nodesWithAlt);
    renderSliceGuide();
    animationId = requestAnimationFrame(tick);

    window.addEventListener('resize', ()=>{
      const {offsetWidth:w, offsetHeight:h}=container;
      globe.width(w); globe.height(h);
      globe.renderer()?.setSize(w,h);
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
