/* ============= AI Operational Picture Globe ============= */
(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.VisualUtils) { console.warn('VisualUtils missing'); return; }
  let countriesCache = null;
  let globe = null;
  let beam = null;
  let scanline = null;
  let particleMesh = null;
  let burstMesh = null;
  let coordRingsGroup = null;
  let animationId = null;
  let currentPhase = 'source';
  let loopTimer = null;
  let lastUserInteraction = Date.now();
  const PARTICLE_COUNT = 18;
  const BURST_COUNT = 12;
  let particleState = [];
  let burstState = [];

  // Core nodes for phases
  const NODES = [
    { id: 'nyc', label: 'NYC Hub', lat: 40.71, lng: -74.0, type: 'hub' },
    { id: 'la', label: 'West Coast Supplier', lat: 34.05, lng: -118.25, type: 'supplier' },
    { id: 'dfw', label: 'QA / DCMA', lat: 32.7767, lng: -96.7970, type: 'qa' },
    { id: 'frankfurt', label: 'EU Logistics', lat: 50.1109, lng: 8.6821, type: 'logistics' },
    { id: 'seoul', label: 'APAC Supplier', lat: 37.5665, lng: 126.9780, type: 'supplier' },
    { id: 'singapore', label: 'Forward Staging', lat: 1.3521, lng: 103.8198, type: 'delivery' },
    { id: 'anchorage', label: 'Polar Transit', lat: 61.2181, lng: -149.9003, type: 'logistics' }
  ];

  // Phase configurations
  const PHASES = {
    source: {
      rings: ['la', 'seoul'],
      highlightNodes: ['la', 'seoul', 'nyc'],
      arcs: [
        { from: 'la', to: 'nyc', color: ['#4DD6FF', '#4DD6FF'] },
        { from: 'seoul', to: 'nyc', color: ['#4DD6FF', '#4DD6FF'] }
      ]
    },
    coordinate: {
      rings: ['nyc', 'frankfurt', 'dfw'],
      highlightNodes: ['nyc', 'frankfurt', 'dfw'],
      arcs: [
        { from: 'nyc', to: 'frankfurt', color: ['#4DD6FF', '#F37514'] },
        { from: 'nyc', to: 'dfw', color: ['#4DD6FF', '#4DD6FF'] },
        { from: 'frankfurt', to: 'anchorage', color: ['#F37514', '#4DD6FF'] }
      ]
    },
    deliver: {
      rings: ['singapore', 'anchorage'],
      highlightNodes: ['singapore', 'anchorage', 'nyc'],
      arcs: [
        { from: 'nyc', to: 'singapore', color: ['#F37514', '#F37514'] },
        { from: 'anchorage', to: 'singapore', color: ['#4DD6FF', '#F37514'] }
      ]
    }
  };
  const PHASE_VISUALS = {
    source: {
      particleColor: '#4DD6FF',
      arcStroke: 1.4,
      arcDashTime: 5200,
      heatTop: 'rgba(77,214,255,0.18)',
      heatSide: 'rgba(77,214,255,0.12)'
    },
    coordinate: {
      particleColor: '#4DD6FF',
      arcStroke: 1.8,
      arcDashTime: 4200,
      heatTop: 'rgba(77,214,255,0.14)',
      heatSide: 'rgba(77,214,255,0.1)'
    },
    deliver: {
      particleColor: '#F37514',
      arcStroke: 2.1,
      arcDashTime: 3600,
      heatTop: 'rgba(243,117,20,0.18)',
      heatSide: 'rgba(77,214,255,0.12)'
    }
  };
  const PHASE_TEXT = {
    source: 'Source: Discovery, intake, and supplier alignment initiated.',
    coordinate: 'Coordinate: QA/DCMA workflows, logistics, and compliance sequencing.',
    deliver: 'Deliver: Final packaging, transit execution, and readiness confirmation.'
  };

  // Heatmap points (activity)
  const HEAT_POINTS = [
    { lat: 34.05, lng: -118.25, weight: 2.0 },
    { lat: 40.71, lng: -74.0, weight: 3.2 },
    { lat: 50.11, lng: 8.68, weight: 1.8 },
    { lat: 37.56, lng: 126.97, weight: 2.4 },
    { lat: 1.35, lng: 103.82, weight: 1.6 },
    { lat: 32.77, lng: -96.79, weight: 1.4 },
    { lat: 61.21, lng: -149.90, weight: 1.1 }
  ];

  function resolveNode(id) {
    return NODES.find(n => n.id === id);
  }

  function buildArcs(phaseKey) {
    const phase = PHASES[phaseKey];
    if (!phase) return [];
    return phase.arcs.map(a => {
      const from = resolveNode(a.from);
      const to = resolveNode(a.to);
      return {
        ...VisualUtils.createArc(from,to,a.color),
        phase: phaseKey
      };
    });
  }

  function buildRings(phaseKey) {
    const phase = PHASES[phaseKey];
    if (!phase) return [];
    return phase.rings.map(id => resolveNode(id)).filter(Boolean);
  }

  function buildPoints(phaseKey) {
    const phase = PHASES[phaseKey];
    const active = phase ? new Set(phase.highlightNodes) : new Set();
    return NODES.map(n => VisualUtils.pulseNode(n, active.has(n.id)));
  }

  function initLegendInteraction(applyPhase) {
    document.querySelectorAll('.legend-item').forEach(item => {
      const phase = item.dataset.phase;
      const activate = () => applyPhase(phase);
      const wrapped = () => {
        lastUserInteraction = Date.now();
        activate();
        restartLoop();
      };
      item.addEventListener('click', wrapped);
      item.addEventListener('mouseenter', wrapped);
    });
  }

  function applyPhase(phaseKey) {
    const arcs = buildArcs(phaseKey);
    const rings = buildRings(phaseKey);
    const points = buildPoints(phaseKey);
    currentPhase = phaseKey;
    resetBursts();
    const phaseCfg = PHASE_VISUALS[phaseKey] || {};

    // Update arcs with dash animation
    globe
      .arcsData(arcs)
      .arcStartLat(d => d.startLat)
      .arcStartLng(d => d.startLng)
      .arcEndLat(d => d.endLat)
      .arcEndLng(d => d.endLng)
      .arcColor(d => d.color)
      .arcStroke(phaseCfg.arcStroke || 1.8)
      .arcAltitude(0.18)
      .arcDashLength(0.22)
      .arcDashGap(0.7)
      .arcDashAnimateTime(prefersReducedMotion ? 0 : (phaseCfg.arcDashTime || parseInt(getComputedStyle(document.documentElement).getPropertyValue('--viz-duration-slow')) || 4200));

    // Points
    globe
      .pointsData(points)
      .pointLat(d => d.lat)
      .pointLng(d => d.lng)
      .pointAltitude(d => (d.active ? 0.12 : 0))
      .pointRadius(d => (d.active ? 0.8 : 0))
      .pointColor(d => {
        if (d.active) return d.type === 'delivery' ? '#F37514' : '#4DD6FF';
        return 'rgba(255,255,255,0)';
      });

    // Rings (analysis)
    if (prefersReducedMotion) {
      globe.ringsData([]);
    } else {
      globe
        .ringsData(rings)
        .ringLat(d => d.lat)
        .ringLng(d => d.lng)
        .ringAltitude(0.01)
        .ringMaxRadius(3)
        .ringPropagationSpeed(1.5)
        .ringRepeatPeriod(2600)
        .ringColor(d => d.id === 'singapore' ? '#F37514' : '#4DD6FF')
        .ringResolution(72);
    }

    // Dispatch custom event for external UI (insight cards)
    const descEl = document.getElementById('phase-desc-text');
    if (descEl && PHASE_TEXT[phaseKey]) {
      descEl.textContent = PHASE_TEXT[phaseKey];
    }

    // Highlight legend state
    document.querySelectorAll('.legend-item').forEach(item => {
      const dot = item.querySelector('.legend-dot');
      if (item.dataset.phase === phaseKey) {
        dot?.classList.add('active');
        item.setAttribute('aria-current', 'true');
      } else {
        dot?.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });

    // Sync extra overlays
    configureParticlesForPhase(phaseKey);
    configureCoordRings(phaseKey);
    configureHeatmap(phaseCfg);
  }

  function addScanningBeam(scene) {
    if (prefersReducedMotion) return;
    beam = VisualUtils.createScanRing(THREE, 0.6, 0.62, 0x4dd6ff, 0.08);
    beam.rotation.x = Math.PI / 2;
    beam.rotation.z = Math.PI / 4;
    beam.position.set(0, 0, 0);
    scene.add(beam);

    // Scanline sweep
    const lineGeom = new THREE.RingGeometry(1.2, 1.35, 64, 1);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x4dd6ff, opacity: 0.06, transparent: true, side: THREE.DoubleSide });
    scanline = new THREE.Mesh(lineGeom, lineMat);
    scanline.rotation.x = Math.PI / 2.3;
    scanline.position.set(0,0,0);
    scene.add(scanline);
  }

  function animateLayers() {
    if (prefersReducedMotion) return;
    const tick = (ts) => {
      const dt = animationId ? (ts - animationId.prev) / 1000 : 0.016;
      animationId = requestAnimationFrame(tick);
      animationId.prev = ts;
      if (beam) beam.rotation.z += 0.0009;
      if (scanline) scanline.rotation.z += 0.0004;
      updateParticles(dt);
      updateBursts(dt);
    };
    animationId = requestAnimationFrame(tick);
  }

  function stopBeam() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
  }

  function nextPhase() {
    const order = ['source', 'coordinate', 'deliver'];
    const idx = order.indexOf(currentPhase);
    const next = order[(idx + 1) % order.length];
    applyPhase(next);
    scheduleLoop();
  }

  function scheduleLoop() {
    clearTimeout(loopTimer);
    const now = Date.now();
    const inactiveFor = now - lastUserInteraction;
    const duration = 8000; // ~8s per phase (6–10s range)
    loopTimer = setTimeout(nextPhase, duration);
  }

  function restartLoop() {
    clearTimeout(loopTimer);
    loopTimer = null;
    scheduleLoop();
  }

  function latLngToVec3(lat, lng, radius) {
    const r = radius || globe.getGlobeRadius?.() || 100;
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.cos(theta)
    );
  }

  function ensureParticleMesh() {
    if (particleMesh || prefersReducedMotion || !globe) return;
    const geom = new THREE.SphereGeometry(0.6, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x4dd6ff, transparent: true, opacity: 0.9 });
    particleMesh = new THREE.InstancedMesh(geom, mat, PARTICLE_COUNT);
    particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    particleMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3);
    globe.scene().add(particleMesh);
  }

  function ensureBurstMesh() {
    if (burstMesh || prefersReducedMotion || !globe) return;
    const geom = new THREE.SphereGeometry(1.2, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xF37514, transparent: true, opacity: 0.0 });
    burstMesh = new THREE.InstancedMesh(geom, mat, BURST_COUNT);
    burstMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    burstMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(BURST_COUNT * 3), 3);
    globe.scene().add(burstMesh);
  }

  function configureParticlesForPhase(phaseKey) {
    if (prefersReducedMotion || !globe) return;
    ensureParticleMesh();
    ensureBurstMesh();
    const arcs = buildArcs(phaseKey);
    if (!arcs.length) return;
    const phaseCfg = PHASE_VISUALS[phaseKey] || {};
    const radius = globe.getGlobeRadius?.() || 100;
    particleState = new Array(PARTICLE_COUNT).fill(0).map((_, i) => {
      const arc = arcs[i % arcs.length];
      const start = latLngToVec3(arc.startLat, arc.startLng, radius);
      const end = latLngToVec3(arc.endLat, arc.endLng, radius);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const reverse = i % 2 === 0 && phaseKey !== 'deliver';
      return {
        curve,
        t: Math.random(),
        speed: 0.08 + Math.random() * 0.06,
        color: phaseCfg.particleColor || arc.color[arc.color.length - 1],
        reverse
      };
    });
    burstState = new Array(BURST_COUNT).fill(0).map(() => ({
      active: false,
      life: 0,
      pos: new THREE.Vector3()
    }));
  }

  function configureCoordRings(phaseKey) {
    if (!globe || prefersReducedMotion) return;
    if (!coordRingsGroup) {
      coordRingsGroup = new THREE.Group();
      globe.scene().add(coordRingsGroup);
    }
    coordRingsGroup.visible = phaseKey === 'coordinate';
    coordRingsGroup.clear();
    if (phaseKey !== 'coordinate') return;
    const hubs = ['nyc', 'frankfurt', 'dfw'];
    const radius = globe.getGlobeRadius?.() || 100;
    hubs.forEach(id => {
      const n = resolveNode(id);
      if (!n) return;
      const ring = VisualUtils.createScanRing(THREE, 1.05, 1.08, 0x4dd6ff, 0.1);
      const pos = latLngToVec3(n.lat, n.lng, radius * 1.01);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0,0,0));
      coordRingsGroup.add(ring);
    });
  }

  function updateParticles(dt) {
    if (prefersReducedMotion || !particleMesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    particleState.forEach((p, idx) => {
      p.t += p.speed * dt * (p.reverse ? -1 : 1);
      if (p.t > 1) p.t = 0;
      if (p.t < 0) p.t = 1;
      const pos = p.curve.getPoint(p.t);
      dummy.position.copy(pos);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      particleMesh.setMatrixAt(idx, dummy.matrix);
      color.setStyle(p.color || '#4DD6FF');
      particleMesh.setColorAt(idx, color);

      // Delivery burst trigger near end point for deliver phase
      if (currentPhase === 'deliver' && p.t > 0.96) {
        triggerBurst(pos);
      }
    });
    particleMesh.instanceMatrix.needsUpdate = true;
    if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;
  }

  function triggerBurst(pos) {
    if (!burstMesh || prefersReducedMotion) return;
    const available = burstState.find(b => !b.active);
    if (!available) return;
    available.active = true;
    available.life = 1;
    available.pos.copy(pos);
  }

  function updateBursts(dt) {
    if (!burstMesh || prefersReducedMotion) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color('#F37514');
    burstState.forEach((b, idx) => {
      if (!b.active) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        burstMesh.setMatrixAt(idx, dummy.matrix);
        return;
      }
      b.life -= dt * 1.5;
      if (b.life <= 0) {
        b.active = false;
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        burstMesh.setMatrixAt(idx, dummy.matrix);
        return;
      }
      const s = 1 + (1 - b.life) * 2;
      dummy.position.copy(b.pos);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      burstMesh.setMatrixAt(idx, dummy.matrix);
      const opacity = b.life * 0.6;
      burstMesh.material.opacity = opacity;
      burstMesh.setColorAt(idx, color);
    });
    burstMesh.instanceMatrix.needsUpdate = true;
    if (burstMesh.instanceColor) burstMesh.instanceColor.needsUpdate = true;
  }

  function resetBursts() {
    burstState.forEach(b => { b.active = false; b.life = 0; });
    if (burstMesh) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < BURST_COUNT; i++) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        burstMesh.setMatrixAt(i, dummy.matrix);
      }
      burstMesh.instanceMatrix.needsUpdate = true;
    }
  }

  function setupHeatmap() {
    globe
      .hexBinPointsData(HEAT_POINTS)
      .hexBinPointLat(d => d.lat)
      .hexBinPointLng(d => d.lng)
      .hexBinPointWeight(d => d.weight)
      .hexAltitude(d => 0.01 + d.sumWeight / 60)
      .hexBinResolution(3)
      .hexTopColor(() => 'rgba(243,117,20,0.15)')
      .hexSideColor(() => 'rgba(77,214,255,0.12)')
      .hexBinMerge(false);
  }

  function configureHeatmap(phaseCfg) {
    if (!globe) return;
    const top = phaseCfg?.heatTop || 'rgba(243,117,20,0.15)';
    const side = phaseCfg?.heatSide || 'rgba(77,214,255,0.12)';
    globe.hexTopColor(() => top).hexSideColor(() => side);
  }

  async function loadCountries() {
    if (countriesCache) return countriesCache;
    try {
      const res = await fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson');
      const data = await res.json();
      countriesCache = data.features || [];
    } catch (e) {
      console.warn('Country data failed to load for land contrast; continuing without outlines.', e);
      countriesCache = [];
    }
    return countriesCache;
  }

  function createGlobe(container) {
    if (!container || typeof Globe === 'undefined' || typeof THREE === 'undefined') return;

    globe = Globe()(container)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .backgroundColor('#0B0D11')
      .showAtmosphere(true)
      .atmosphereColor('#4DD6FF')
      .atmosphereAltitude(0.18)
      .polygonsData([]);

    // Configure renderer
    const renderer = globe.renderer();
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const { offsetWidth: w, offsetHeight: h } = container;
      if (w && h) {
        renderer.setSize(w, h);
        globe.width(w);
        globe.height(h);
      }
    }

    // Camera & controls
    const pov = { lat: 25, lng: -20, altitude: 2.4 };
    globe.pointOfView(pov, 0);
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = !prefersReducedMotion;
      controls.autoRotateSpeed = 0.15;
      controls.enableZoom = false;
      controls.enablePan = false;
    }

    // Water/land contrast tweak on material
    try {
      const mat = globe.globeMaterial();
      mat.color = new THREE.Color('#070a12');
      mat.emissive = new THREE.Color('#070a12');
      mat.emissiveIntensity = 0.25;
    } catch (e) {
      console.warn('Globe material tweak failed', e);
    }

    // Heatmap layer
    setupHeatmap();

    // Add scanning beam to scene
    addScanningBeam(globe.scene());
    animateLayers();

    // Land outlines for contrast
    loadCountries().then(features => {
      if (!globe || !features?.length) return;
      globe
        .polygonsData(features)
        .polygonCapColor(() => 'rgba(255,255,255,0.06)')
        .polygonSideColor(() => 'rgba(77,214,255,0.06)')
        .polygonStrokeColor(() => 'rgba(77,214,255,0.35)')
        .polygonAltitude(() => 0.006);
    });
  }

  function init() {
    const container = document.getElementById('globe-container');
    if (!container) return;
    if (!window.WebGLRenderingContext) {
      console.warn('WebGL not supported; globe disabled');
      return;
    }

    createGlobe(container);
    if (!globe) return;

    // Initial phase
    applyPhase('source');

    // Legend interaction
    initLegendInteraction(applyPhase);

    // Auto loop through phases
    restartLoop();

    // Resize handling
    window.addEventListener('resize', () => {
      if (!globe) return;
      const { offsetWidth: w, offsetHeight: h } = container;
      if (w && h) {
        globe.width(w);
        globe.height(h);
        globe.renderer()?.setSize(w, h);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup if needed (not currently used, but provided for safety)
  window.cleanupGlobe = function cleanupGlobe() {
    stopBeam();
    if (beam && globe && globe.scene()) {
      globe.scene().remove(beam);
    }
    globe = null;
  };
})();
