(function initNetworkVisual(){
  const container = document.getElementById('micro-map');
  if (!container) return;
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const palette = {
    node: 'rgba(80,125,255,0.95)',
    edge: 'rgba(80,125,255,0.45)',
    packet: 'rgba(255,170,85,0.95)',
    halo: 'rgba(80,125,255,0.20)'
  };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.innerHTML = '';
  container.appendChild(canvas);

  let width = 0;
  let height = 0;
  let nodes = [];
  let edges = [];
  let packets = [];
  let hubs = [];
  let lastTime = 0;
  let animationId = null;

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function initGraph() {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.36;
    const count = Math.floor(rand(6, 12));
    nodes = new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + rand(-0.3, 0.3);
      const r = radius * rand(0.6, 1);
      return {
        baseX: cx + Math.cos(angle) * r,
        baseY: cy + Math.sin(angle) * r,
        x: 0,
        y: 0,
        jitter: rand(1, 3),
        speed: rand(0.3, 0.7),
        phase: rand(0, Math.PI * 2)
      };
    });
    hubs = [0, 1].map(idx => nodes[idx % nodes.length]);

    const edgeCount = Math.floor(rand(10, 20));
    edges = [];
    for (let i = 0; i < edgeCount; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a === b) continue;
      edges.push({ a, b, weight: rand(0.4, 1) });
    }

    packets = edges.slice(0, Math.min(8, edges.length)).map((e, idx) => ({
      edge: e,
      t: Math.random(),
      speed: rand(0.02, 0.05),
      reverse: idx % 2 === 0
    }));
  }

  function update(dt) {
    nodes.forEach(n => {
      n.phase += n.speed * dt;
      const offset = Math.sin(n.phase) * n.jitter;
      const offsetY = Math.cos(n.phase * 0.8) * n.jitter;
      n.x = n.baseX + offset;
      n.y = n.baseY + offsetY;
    });
    packets.forEach(p => {
      p.t += p.speed * dt * (p.reverse ? -1 : 1);
      if (p.t > 1) p.t = 0;
      if (p.t < 0) p.t = 1;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Circle frame
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Edges
    edges.forEach(e => {
      ctx.strokeStyle = palette.edge;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6 * e.weight;
      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y);
      ctx.lineTo(e.b.x, e.b.y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Packets
    packets.forEach(p => {
      const { a, b } = p.edge;
      const t = p.t;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      ctx.fillStyle = palette.packet;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Nodes with halo
    nodes.forEach(n => {
      const isHub = hubs.includes(n);
      if (isHub) {
        ctx.fillStyle = palette.halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = palette.node;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isHub ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop(ts) {
    if (prefersReduce) { draw(); return; }
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    update(dt);
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    initGraph();
    lastTime = performance.now();
    if (prefersReduce) draw();
    else animationId = requestAnimationFrame(loop);
  }

  const observer = new ResizeObserver(() => {
    resize();
    initGraph();
  });
  observer.observe(container);

  start();
})();
