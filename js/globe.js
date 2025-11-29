/* ============= AI Operational Picture Globe (3-phase scripted loop, revised) ============= */
(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.VisualUtils) { console.warn('VisualUtils missing'); return; }

  const PHASES = ['source','coordinate','deliver'];
  const PHASE_DURATION = 5000;
  const MANUAL_PAUSE_MS = 10000;

  const POVS = {
    sourceStart: { lat: 50, lng: 10, altitude: 2.0 },
    sourceEnd: { lat: 37, lng: -95, altitude: 2.0 },
    coordinateUS: { lat: 37, lng: -95, altitude: 1.1 },
    coordinateEU: { lat: 50, lng: 10, altitude: 1.1 },
    deliver: { lat: 40, lng: -20, altitude: 2.0 },
    loopReset: { lat: 50, lng: 10, altitude: 2.0 }
  };

  const EASING = {
    easeInOutCubic: t => t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeOutBack: t => {
      const c1 = 1.70158; const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
  };

  // Nodes
  const SUPPLIERS_US = [
    { id: 'nyc', lat: 40.7128, lng: -74.0060 },
    { id: 'chi', lat: 41.8781, lng: -87.6298 },
    { id: 'la',  lat: 34.0522, lng: -118.2437 },
    { id: 'hou', lat: 29.7604, lng: -95.3698 }
  ];
  const SUPPLIERS_CAN = [
    { id: 'tor', lat: 43.6532, lng: -79.3832 },
    { id: 'mtl', lat: 45.5017, lng: -73.5673 }
  ];
  const SUPPLIERS_EU = [
    { id: 'lon', lat: 51.5074, lng: -0.1278 },
    { id: 'ber', lat: 52.5200, lng: 13.4050 },
    { id: 'par', lat: 48.8566, lng: 2.3522 },
    { id: 'rom', lat: 41.9028, lng: 12.4964 },
    { id: 'ist', lat: 41.0082, lng: 28.9784 }
  ];
  const DEST_US = [
    { id: 'norfolk', lat: 36.8508, lng: -76.2859 },
    { id: 'sdiego', lat: 32.7157, lng: -117.1611 },
    { id: 'charleston', lat: 32.7765, lng: -79.9311 }
  ];

  let globe, particleMesh, particleState = [], beam, scanline;
  let countryCache = null;
  let currentPhase = 'source';
  let phaseTimer = null;
  let manualResumeAt = 0;
  let animationId = null;
  let povTweenId = null;
  let phaseTimeouts = [];
  let nodeAppearProgress = new Map();
  let coordTraces = [];
  let hudLayer = null;
  let hudEntries = [];

  // Utility
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  function clearPhaseTimeouts(){ phaseTimeouts.forEach(clearTimeout); phaseTimeouts=[]; }
  function cancelPovTween(){ if(povTweenId) cancelAnimationFrame(povTweenId); povTweenId=null; }

  function tweenPOV(from,to,duration, easeFn=EASING.easeInOutCubic){
    cancelPovTween();
    const start=performance.now();
    const lerp=(a,b,t)=>a+(b-a)*t;
    const step=(now)=>{
      const raw=(now-start)/duration; const t=clamp(raw,0,1); const e=easeFn(t);
      const lat=lerp(from.lat,to.lat,e); const lng=lerp(from.lng,to.lng,e); const altitude=lerp(from.altitude,to.altitude,e);
      try{ globe.pointOfView({lat,lng,altitude},0);}catch(err){}
      if(t<1) povTweenId=requestAnimationFrame(step);
    };
    povTweenId=requestAnimationFrame(step);
  }

  // Country data
  async function loadCountries(){
    if(countryCache) return countryCache;
    try{ const res=await fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'); const data=await res.json(); countryCache=data.features||[]; }
    catch(e){ console.warn('Country data failed',e); countryCache=[]; }
    return countryCache;
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
    globe.pointOfView(POVS.sourceStart,0);
    const controls = globe.controls();
    if(controls){ controls.autoRotate = !prefersReducedMotion; controls.autoRotateSpeed = 0.08; controls.enableZoom=false; controls.enablePan=false; }

    try{ const mat=globe.globeMaterial(); mat.color=new THREE.Color('#070a12'); mat.emissive=new THREE.Color('#070a12'); mat.emissiveIntensity=0.25; }catch(e){}

    beam = VisualUtils.createScanRing(THREE,0.6,0.62,0x4dd6ff,0.08);
    beam.rotation.x=Math.PI/2; beam.rotation.z=Math.PI/4; globe.scene().add(beam);
    const lineGeom=new THREE.RingGeometry(1.2,1.35,64,1);
    const lineMat=new THREE.MeshBasicMaterial({color:0x4dd6ff,opacity:0.1,transparent:true,side:THREE.DoubleSide});
    scanline=new THREE.Mesh(lineGeom,lineMat); scanline.rotation.x=Math.PI/2.3; globe.scene().add(scanline);

    loadCountries().then(features=>{ if(!features.length) return; globe.polygonsData(features).polygonCapColor(()=> 'rgba(255,255,255,0.06)').polygonSideColor(()=> 'rgba(77,214,255,0.08)').polygonStrokeColor(()=> 'rgba(77,214,255,0.35)').polygonAltitude(()=>0.006); });

    // HUD layer
    hudLayer = document.createElement('div');
    hudLayer.className = 'hud-layer';
    container.style.position = container.style.position || 'relative';
    container.appendChild(hudLayer);
  }

  function ensureParticles(count){
    if(prefersReducedMotion) return;
    if(particleMesh && particleMesh.count===count) return;
    if(particleMesh) globe.scene().remove(particleMesh);
    const geom=new THREE.SphereGeometry(0.9,6,6);
    const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0.9});
    particleMesh=new THREE.InstancedMesh(geom,mat,count);
    particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    particleMesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(count*3),3);
    globe.scene().add(particleMesh);
  }

  function latLngToVec3(lat,lng,radius){
    const r=radius||globe.getGlobeRadius?.()||100;
    const phi=(90-lat)*Math.PI/180; const theta=(lng+180)*Math.PI/180;
    return new THREE.Vector3(-r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.cos(theta));
  }

  function buildParticlesFromArcs(arcs,speedBase=0.35){
    if(!arcs.length) return [];
    const radius=globe.getGlobeRadius?.()||100;
    return arcs.map(arc=>{
      const start=latLngToVec3(arc.startLat,arc.startLng,radius);
      const end=latLngToVec3(arc.endLat,arc.endLng,radius);
      const mid=start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius*1.2);
      const curve=new THREE.QuadraticBezierCurve3(start,mid,end);
      return {curve,t:Math.random(),speed:speedBase+Math.random()*0.12,color:arc.color[arc.color.length-1]};
    });
  }

  function updateParticles(dt){
    if(prefersReducedMotion||!particleMesh) return;
    const dummy=new THREE.Object3D(); const color=new THREE.Color();
    particleState.forEach((p,i)=>{
      p.t+=p.speed*dt; if(p.t>1) p.t=0;
      const pos=p.curve.getPoint(p.t);
      dummy.position.copy(pos); dummy.scale.setScalar(1); dummy.updateMatrix();
      particleMesh.setMatrixAt(i,dummy.matrix); color.setStyle(p.color||'#4DD6FF'); particleMesh.setColorAt(i,color);
    });
    particleMesh.instanceMatrix.needsUpdate=true; if(particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate=true;
  }

  function applyHeatmap(points, top, side){
    globe.hexBinPointsData(points).hexBinPointLat(d=>d.lat).hexBinPointLng(d=>d.lng).hexBinPointWeight(()=>1).hexAltitude(()=>0.01).hexBinResolution(3).hexTopColor(()=>top).hexSideColor(()=>side).hexBinMerge(false);
  }

  // SOURCE
  function enterSource(){
    currentPhase='source';
    clearPhaseTimeouts(); cancelPovTween();
    tweenPOV(POVS.sourceStart, POVS.sourceEnd, 3500, EASING.easeInOutCubic);
    const controls=globe.controls(); if(controls) controls.autoRotateSpeed=0.05;

    const points=[...SUPPLIERS_EU, ...SUPPLIERS_CAN, ...SUPPLIERS_US];
    nodeAppearProgress.clear();
    let delay=0;
    const order=[SUPPLIERS_EU, SUPPLIERS_CAN, SUPPLIERS_US];
    order.forEach(group=>{
      group.forEach(n=>{ nodeAppearProgress.set(n.id,{start:performance.now()+delay,duration:500}); delay+=150+Math.random()*100; });
    });

    globe.arcsData([]);
    globe.pointsData(points).pointLat(d=>d.lat).pointLng(d=>d.lng).pointAltitude(d=>{
      const st=nodeAppearProgress.get(d.id); if(!st) return 0.1; const t=clamp((performance.now()-st.start)/st.duration,0,1); const e=EASING.easeOutBack(t);
      return 0.1 + 0.02*e;
    }).pointRadius(d=>{
      const st=nodeAppearProgress.get(d.id); if(!st) return 0.8; const t=clamp((performance.now()-st.start)/st.duration,0,1); const e=EASING.easeOutBack(t);
      return 0.8*e;
    }).pointColor(d=>{
      const st=nodeAppearProgress.get(d.id); if(!st) return 'rgba(77,214,255,1)'; const t=clamp((performance.now()-st.start)/st.duration,0,1); const e=EASING.easeOutBack(t);
      return `rgba(77,214,255,${e})`;
    });

    globe.ringsData(points).ringLat(d=>d.lat).ringLng(d=>d.lng).ringAltitude(0.01).ringMaxRadius(2.5).ringPropagationSpeed(2.4).ringRepeatPeriod(1400).ringColor(()=> '#4DD6FF').ringResolution(64);

    applyHeatmap(points,'rgba(77,214,255,0.12)','rgba(77,214,255,0.08)');
    particleState=[]; ensureParticles(1);
  }

  // COORDINATE
  function enterCoordinate(){
    currentPhase='coordinate';
    clearPhaseTimeouts(); cancelPovTween();
    const controls=globe.controls(); if(controls) controls.autoRotateSpeed=0.05;

    // Zoom into US
    tweenPOV(POVS.sourceEnd, POVS.coordinateUS, 1000, EASING.easeInOutCubic);

    const usPairs = buildPairs([...SUPPLIERS_US, ...SUPPLIERS_CAN]);
    const euPairs = buildPairs(SUPPLIERS_EU);

    // Start US traces
    startTracing(usPairs, 0);
    destroyHudEntries();
    createHudEntries([...SUPPLIERS_US, ...SUPPLIERS_CAN], 'US');

    // After half phase, pan to EU and start EU traces
    phaseTimeouts.push(setTimeout(()=>{
      tweenPOV(POVS.coordinateUS, POVS.coordinateEU, 1000, EASING.easeInOutCubic);
      startTracing(euPairs, performance.now());
      destroyHudEntries();
      createHudEntries(SUPPLIERS_EU, 'EU');
    }, PHASE_DURATION/2));

    globe.pointsData([...SUPPLIERS_US,...SUPPLIERS_CAN,...SUPPLIERS_EU])
      .pointLat(d=>d.lat).pointLng(d=>d.lng).pointAltitude(()=>0.1).pointRadius(()=>0.8).pointColor(()=> '#4DD6FF');

    globe.ringsData([...SUPPLIERS_US,...SUPPLIERS_CAN,...SUPPLIERS_EU])
      .ringLat(d=>d.lat).ringLng(d=>d.lng).ringAltitude(0.01).ringMaxRadius(3.5)
      .ringPropagationSpeed(1.4).ringRepeatPeriod(2400).ringColor(()=> '#4DD6FF').ringResolution(72);

    applyHeatmap([...SUPPLIERS_US,...SUPPLIERS_CAN,...SUPPLIERS_EU],'rgba(77,214,255,0.14)','rgba(77,214,255,0.1)');
  }

  function buildPairs(nodes){
    const pairs=[]; const count=Math.min(10, nodes.length*2);
    for(let i=0;i<count;i++){
      const a=nodes[Math.floor(Math.random()*nodes.length)];
      const b=nodes[Math.floor(Math.random()*nodes.length)];
      if(a===b) continue;
      pairs.push({ startLat:a.lat,startLng:a.lng,endLat:b.lat,endLng:b.lng,color:['#4DD6FF','#4DD6FF'] });
    }
    return pairs.slice(0,10);
  }

  function startTracing(pairs, startTime){
    coordTraces = pairs.map((p,idx)=>({ arc:p, start:(startTime||performance.now()) + idx*220, state:'grow' }));
  }

  // HUD helpers
  function createHudEntries(nodes, regionLabel) {
    if (!hudLayer) return;
    const now = performance.now();
    const delayBase = 220;
    destroyHudEntries(false);
    hudEntries = nodes.map((node, idx) => {
      const el = document.createElement('div');
      el.className = 'hud-box';
      el.dataset.nodeId = node.id;
      const sample = [
        `${regionLabel} Supplier ${idx + 1}`,
        `Est. Value: $${(150 + Math.floor(Math.random()*200))}k`,
        `AI Confidence: ${80 + Math.floor(Math.random()*15)}%`
      ].join('\n');
      el._fullText = sample;
      el._typingIdx = 0;
      el._typingSpeed = 15 + Math.random()*10;
      el._typingStart = 0;
      el._fadeStart = now + idx*(delayBase + Math.random()*100);
      el._fadeDur = 350;
      el._state = 'fade';
      el._fadeOutStart = 0;
      el._fadeOutDur = 250;
      el.textContent = '';
      hudLayer.appendChild(el);
      return { node, el };
    });
  }

  function destroyHudEntries(removeNow = true) {
    if (!hudEntries) return;
    if (removeNow) {
      hudEntries.forEach(({ el }) => { if (el && el.parentNode) el.parentNode.removeChild(el); });
      hudEntries = [];
    } else {
      hudEntries.forEach(({ el }) => { el && el.remove(); });
      hudEntries = [];
    }
  }

  function projectToScreen(lat, lng, altitude=0) {
    if (!globe) return null;
    const radius = globe.getGlobeRadius?.() || 100;
    const vec = latLngToVec3(lat, lng, radius + altitude*radius);
    const camera = globe.camera();
    const renderer = globe.renderer();
    if (!renderer) return null;
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const projected = vec.clone().project(camera);
    if (projected.z > 1) return null;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;
    return { x, y };
  }

  function updateHudPositions() {
    if (!hudEntries || !hudEntries.length) return;
    const now = performance.now();
    hudEntries.forEach(({ node, el }) => {
      const pos = projectToScreen(node.lat, node.lng, 0.02);
      if (!pos) { el.style.display = 'none'; return; }
      el.style.display = 'block';
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y - 10}px`;

      if (el._state === 'fade') {
        const t = clamp((now - el._fadeStart) / el._fadeDur, 0, 1);
        const eased = EASING.easeOutCubic(t);
        if (t >= 1) {
          el.classList.add('visible');
          el._state = 'typing';
          el._typingStart = now;
          el._typingIdx = 0;
        } else {
          el.style.opacity = eased;
          const s = 0.9 + 0.1 * eased;
          el.style.transform = `translate(-50%, -100%) scale(${s})`;
        }
      }
      if (el._state === 'typing') {
        const dt = now - el._typingStart;
        const chars = Math.floor(dt / el._typingSpeed);
        if (chars > el._typingIdx) {
          el._typingIdx = Math.min(el._fullText.length, chars);
          el.textContent = el._fullText.slice(0, el._typingIdx);
          if (el._typingIdx >= el._fullText.length) el._state = 'done';
        }
      }
      if (el._state === 'fadeout') {
        const t = clamp((now - el._fadeOutStart) / el._fadeOutDur, 0, 1);
        const eased = EASING.easeOutCubic(1 - t);
        el.style.opacity = eased;
        const s = 1 - 0.05 * t;
        el.style.transform = `translate(-50%, -100%) scale(${s})`;
        if (t >= 1) { el.remove(); }
      }
    });
    hudEntries = hudEntries.filter(h => h.el && h.el.parentNode);
  }

  function fadeOutHudEntries() {
    if (!hudEntries || !hudEntries.length) return;
    const now = performance.now();
    hudEntries.forEach(({ el }) => {
      el._state = 'fadeout';
      el._fadeOutStart = now;
    });
    setTimeout(()=> destroyHudEntries(), 280);
  }

  function updateTracing(now){
    if(currentPhase!=='coordinate') return;
    const activeArcs=[]; const particles=[];
    coordTraces.forEach(tr=>{
      const elapsed = now - tr.start;
      if(elapsed < 0) return;
      const growDur=400, particleDur=250, fadeDur=300;
      if(elapsed < growDur){
        const t = clamp(elapsed/growDur,0,1);
        const a={...tr.arc};
        a.dashLength = t; a.alpha=1; activeArcs.push(a);
      } else if(elapsed < growDur + particleDur){
        const a={...tr.arc}; a.dashLength=1; a.alpha=1; activeArcs.push(a);
        const prog = (elapsed-growDur)/particleDur; particles.push({ arc:tr.arc, t:prog });
      } else if(elapsed < growDur + particleDur + fadeDur){
        const a={...tr.arc}; a.dashLength=1; const f=1-((elapsed-growDur-particleDur)/fadeDur); a.alpha=f; activeArcs.push(a);
      }
    });
    globe.arcsData(activeArcs)
      .arcStartLat(d=>d.startLat).arcStartLng(d=>d.startLng)
      .arcEndLat(d=>d.endLat).arcEndLng(d=>d.endLng)
      .arcColor(d=> d.alpha!=null ? [`rgba(77,214,255,${d.alpha})`,`rgba(77,214,255,${d.alpha})`] : d.color)
      .arcStroke(1.2).arcAltitude(0.12)
      .arcDashLength(d=>d.dashLength||1).arcDashGap(0)
      .arcDashAnimateTime(0);

    // particles along traces
    if(particles.length){
      const radius=globe.getGlobeRadius?.()||100;
      const dummy=new THREE.Object3D(); const color=new THREE.Color('#4DD6FF');
      ensureParticles(particles.length);
      particles.forEach((p,i)=>{
        const start=latLngToVec3(p.arc.startLat,p.arc.startLng,radius);
        const end=latLngToVec3(p.arc.endLat,p.arc.endLng,radius);
        const mid=start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius*1.2);
        const curve=new THREE.QuadraticBezierCurve3(start,mid,end);
        const pos=curve.getPoint(p.t);
        dummy.position.copy(pos); dummy.scale.setScalar(1); dummy.updateMatrix();
        particleMesh.setMatrixAt(i,dummy.matrix); particleMesh.setColorAt(i,color);
      });
      particleMesh.instanceMatrix.needsUpdate=true; particleMesh.instanceColor.needsUpdate=true;
    }
  }

  // DELIVER
  function enterDeliver(){
    currentPhase='deliver';
    clearPhaseTimeouts(); cancelPovTween();
    tweenPOV(POVS.coordinateEU, POVS.deliver, 1000, EASING.easeInOutCubic);

    const routes = buildDeliveryRoutes();
    globe.arcsData(routes)
      .arcStartLat(d=>d.startLat).arcStartLng(d=>d.startLng)
      .arcEndLat(d=>d.endLat).arcEndLng(d=>d.endLng)
      .arcColor(d=> d.optimized ? ['#00FF8A','#00FF8A'] : ['#4DD6FF','#F37514'])
      .arcStroke(2.0).arcAltitude(0.22)
      .arcDashLength(0.2).arcDashGap(0.5)
      .arcDashAnimateTime(prefersReducedMotion?0:1800);

    globe.pointsData([...SUPPLIERS_US,...SUPPLIERS_CAN,...SUPPLIERS_EU,...DEST_US])
      .pointLat(d=>d.lat).pointLng(d=>d.lng).pointAltitude(()=>0.12)
      .pointRadius(d=> DEST_US.some(n=>n.id===d.id) ? 1.1 : 0.8)
      .pointColor(()=> '#4DD6FF');

    globe.ringsData(DEST_US)
      .ringLat(d=>d.lat).ringLng(d=>d.lng).ringAltitude(0.01)
      .ringMaxRadius(4.0).ringPropagationSpeed(1.2).ringRepeatPeriod(2600)
      .ringColor(()=> '#F37514').ringResolution(72);

    applyHeatmap([...SUPPLIERS_US,...SUPPLIERS_CAN,...SUPPLIERS_EU,...DEST_US],'rgba(243,117,20,0.15)','rgba(77,214,255,0.1)');

    particleState = buildParticlesFromArcs(routes, 0.5);
    particleState.forEach((p,i)=>{ if(routes[i]?.optimized) p.color='#00FF8A'; });
    ensureParticles(particleState.length||1);
  }

  function buildDeliveryRoutes(){
    const origins = SUPPLIERS_EU;
    const dests = DEST_US;
    return origins.map((o,i)=> ({
      startLat:o.lat,startLng:o.lng,
      endLat:dests[i%dests.length].lat, endLng:dests[i%dests.length].lng,
      color:['#4DD6FF','#F37514'], optimized: i%4===0
    }));
  }

  // Phase loop
  function setPhase(phase, opts={manual:false}){
    const prevPhase = currentPhase;
    clearTimeout(phaseTimer); clearPhaseTimeouts(); cancelPovTween();
    currentPhase=phase; if(opts.manual) manualResumeAt=Date.now()+MANUAL_PAUSE_MS;
    if(prevPhase==='coordinate' && phase!=='coordinate') fadeOutHudEntries();

    if(phase==='source') enterSource();
    if(phase==='coordinate') enterCoordinate();
    if(phase==='deliver') enterDeliver();

    document.querySelectorAll('.legend-item').forEach(item=>{
      const dot=item.querySelector('.legend-dot'); const active=item.dataset.phase===phase;
      dot?.classList.toggle('active', active); if(active) item.setAttribute('aria-current','true'); else item.removeAttribute('aria-current');
    });

    const descEl=document.getElementById('phase-desc-text');
    if(descEl){
      const map={
        source:'<span class="phase-body">Intake, supplier validation, and early risk scoring start here.</span>',
        coordinate:'<span class="phase-body">Logistics, QA/DCMA, and compliance are synchronized in one flow.</span>',
        deliver:'<span class="phase-body">Final packaging, transit execution, and readiness confirmation.</span>'
      }; descEl.innerHTML=map[phase]||'';
    }

    phaseTimer=setTimeout(()=>{
      if(Date.now()<manualResumeAt){ phaseTimer=setTimeout(()=>setPhase(phase),500); return; }
      const next=PHASES[(PHASES.indexOf(phase)+1)%PHASES.length];
      // ensure reset from deliver back to source start pose
      if(phase==='deliver' && next==='source'){
        tweenPOV(POVS.deliver, POVS.loopReset, 900, EASING.easeInOutCubic);
        setTimeout(()=> setPhase(next), 900);
      } else {
        setPhase(next);
      }
    }, PHASE_DURATION);
  }

  // Animation loop
  function tick(ts){
    const dt = animationId ? (ts-(tick.prev||ts))/1000 : 0.016; tick.prev=ts;
    updateParticles(dt);
    updateHudPositions();
    if(currentPhase==='source'){ // refresh point scaling
      globe.pointsData(globe.pointsData());
    }
    if(currentPhase==='coordinate') updateTracing(performance.now());
    if(beam) beam.rotation.z += 0.0009;
    if(scanline) scanline.rotation.z += 0.0004;
    animationId=requestAnimationFrame(tick);
  }

  function initLegend(){
    document.querySelectorAll('.legend-item').forEach(item=>{
      const phase=item.dataset.phase; const handler=()=> setPhase(phase,{manual:true});
      item.addEventListener('click',handler); item.addEventListener('mouseenter',handler);
    });
  }

  function init(){
    const container=document.getElementById('globe-container');
    if(!container || !window.WebGLRenderingContext) return;
    createGlobe(container); if(!globe) return;
    initLegend();
    setPhase('source');
    animationId=requestAnimationFrame(tick);
    window.addEventListener('resize', ()=>{
      const {offsetWidth:w, offsetHeight:h}=container; globe.width(w); globe.height(h); globe.renderer()?.setSize(w,h);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
