(function(){
  const TWO_PI = Math.PI * 2;

  function createArc(from, to, color){
    return {
      startLat: from.lat,
      startLng: from.lng,
      endLat: to.lat,
      endLng: to.lng,
      color
    };
  }

  function pulseNode(node, active=false){
    return {
      ...node,
      active,
      altitude: active ? 0.12 : 0.06,
      radius: 0.8
    };
  }

  function makeGlowMaterial(THREE, color, opacity){
    return new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
  }

  function createScanRing(THREE, inner=0.6, outer=0.62, color=0x4dd6ff, opacity=0.08){
    const geo = new THREE.RingGeometry(inner, outer, 64);
    const mat = new THREE.MeshBasicMaterial({ color, transparent:true, opacity, side:THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI/2;
    return mesh;
  }

  function easeTimeline(t){
    // cubic-bezier(.22,.61,.36,1) approximation
    return t*t*(3 - 2*t);
  }

  window.VisualUtils = {
    createArc,
    pulseNode,
    makeGlowMaterial,
    createScanRing,
    easeTimeline,
    TWO_PI
  };
})();
