/* ============= Spinning Hardware 3D Component ============= */
/**
 * Reusable Three.js component for rendering spinning 3D hardware (nut/bolt/screw)
 * with transparent background, slow rotation, and full accessibility support.
 */

(function() {
  'use strict';

  // Check for WebGL support
  function hasWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // SVG Fallback Generator
  function createSVGFallback(variant, size, color) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('fill', 'none');
    g.setAttribute('stroke', color || '#666666');
    g.setAttribute('stroke-width', '2');
    
    if (variant === 'nut') {
      // Hex nut outline
      const hexPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = 50 + 30 * Math.cos(angle);
        const y = 50 + 30 * Math.sin(angle);
        points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
      }
      hexPath.setAttribute('d', points.join(' ') + ' Z');
      g.appendChild(hexPath);
      
      // Inner circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '12');
      g.appendChild(circle);
    } else if (variant === 'bolt') {
      // Hex head
      const hexPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = 50 + 25 * Math.cos(angle);
        const y = 50 + 25 * Math.sin(angle);
        points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
      }
      hexPath.setAttribute('d', points.join(' ') + ' Z');
      g.appendChild(hexPath);
      
      // Shaft
      const shaft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shaft.setAttribute('x', '47');
      shaft.setAttribute('y', '75');
      shaft.setAttribute('width', '6');
      shaft.setAttribute('height', '20');
      shaft.setAttribute('rx', '3');
      g.appendChild(shaft);
    } else { // screw
      // Screw head (flat)
      const head = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      head.setAttribute('x', '40');
      head.setAttribute('y', '35');
      head.setAttribute('width', '20');
      head.setAttribute('height', '8');
      head.setAttribute('rx', '2');
      g.appendChild(head);
      
      // Screw body with thread lines
      const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      body.setAttribute('x1', '50');
      body.setAttribute('y1', '43');
      body.setAttribute('x2', '50');
      body.setAttribute('y2', '85');
      g.appendChild(body);
      
      // Thread lines
      for (let i = 0; i < 5; i++) {
        const thread = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        thread.setAttribute('x1', '45');
        thread.setAttribute('y1', 48 + i * 8);
        thread.setAttribute('x2', '55');
        thread.setAttribute('y2', 48 + i * 8);
        g.appendChild(thread);
      }
    }
    
    svg.appendChild(g);
    return svg;
  }

  // Main Component Class
  class SpinningHardware3D {
    constructor(options = {}) {
      this.variant = options.variant || 'screw';
      this.size = options.size || 250;
      this.color = options.color || '#888888';
      this.speed = options.speed || 0.015; // radians per frame
      this.ariaLabel = options.ariaLabel || null;
      this.container = options.container || null;
      
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.group = null;
      this.animationId = null;
      this.isPaused = false;
      this.isInitialized = false;
      
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (!this.container) {
        console.warn('SpinningHardware3D: No container provided');
        return;
      }
      
      this.init();
    }

    init() {
      // Create wrapper span
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.width = `${this.size}px`;
      wrapper.style.height = `${this.size}px`;
      wrapper.style.position = 'relative';
      wrapper.style.verticalAlign = 'middle';
      
      if (this.ariaLabel) {
        wrapper.setAttribute('aria-label', this.ariaLabel);
        wrapper.setAttribute('role', 'img');
      } else {
        wrapper.setAttribute('aria-hidden', 'true');
      }
      
      // Check WebGL support
      if (!hasWebGLSupport()) {
        const svg = createSVGFallback(this.variant, this.size, this.color);
        wrapper.appendChild(svg);
        this.container.appendChild(wrapper);
        return;
      }
      
      // Create canvas container
      const canvasContainer = document.createElement('div');
      canvasContainer.style.width = '100%';
      canvasContainer.style.height = '100%';
      canvasContainer.style.position = 'relative';
      wrapper.appendChild(canvasContainer);
      this.container.appendChild(wrapper);
      
      this.canvasContainer = canvasContainer;
      
      // Set up IntersectionObserver for lazy loading
      this.setupLazyLoad();
    }

    setupLazyLoad() {
      const observerOptions = {
        threshold: 0.2,
        rootMargin: '50px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isInitialized) {
            this.initializeThreeJS();
            observer.unobserve(this.container);
          }
        });
      }, observerOptions);
      
      observer.observe(this.container);
      
      // Also check if already visible
      const rect = this.container.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible && !this.isInitialized) {
        this.initializeThreeJS();
        observer.unobserve(this.container);
      }
    }

    initializeThreeJS() {
      if (this.isInitialized) return;
      this.isInitialized = true;
      
      // Clamp DPR to ≤2
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.size, this.size);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setClearColor(0x000000, 0); // Transparent background
      this.canvasContainer.appendChild(this.renderer.domElement);
      
      // Create scene
      this.scene = new THREE.Scene();
      
      // Create camera
      const fov = 32; // Field of view between 28-35°
      this.camera = new THREE.PerspectiveCamera(
        fov,
        this.size / this.size,
        0.1,
        1000
      );
      this.camera.position.z = 8;
      
      // Setup lighting
      this.setupLighting();
      
      // Create geometry
      this.createGeometry();
      
      // Start animation
      if (!this.prefersReducedMotion) {
        this.animate();
      } else {
        // Set static angle for reduced motion
        if (this.variant === 'screw') {
          // Screw: diagonal orientation with y-axis rotation
          this.group.rotation.z = Math.PI / 4; // 45 degrees
          this.group.rotation.x = Math.PI / 6; // 30 degrees
          this.group.rotation.y = 0.7; // Static y rotation for view
        } else {
          // Other variants: x-axis rotation
          this.group.rotation.x = 0.7;
          this.group.rotation.y = 0;
        }
        this.renderer.render(this.scene, this.camera);
      }
      
      // Handle resize
      this.setupResize();
    }

    setupLighting() {
      // Key light (bright, angled from top-right)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(5, 8, 5);
      this.scene.add(keyLight);
      
      // Fill light (softer, opposite side)
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-5, 3, 5);
      this.scene.add(fillLight);
      
      // Rim light (subtle, back edge)
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
      rimLight.position.set(0, 0, -8);
      this.scene.add(rimLight);
      
      // Ambient light (soft, low intensity)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      this.scene.add(ambientLight);
    }

    createGeometry() {
      this.group = new THREE.Group();
      
      // Use darker material for screw to match the image
      const baseColor = this.variant === 'screw' ? '#2a2a2a' : this.color;
      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: this.variant === 'screw' ? 0.3 : 0.9,
        roughness: this.variant === 'screw' ? 0.7 : 0.25,
        envMapIntensity: 1.0,
        // Add edge lines for vectorized look on screw
        wireframe: false
      });
      
      // For screw, also create an edge helper for vectorized look
      let edgeMaterial = null;
      if (this.variant === 'screw') {
        edgeMaterial = new THREE.LineBasicMaterial({
          color: '#1a1a1a',
          linewidth: 1
        });
      }
      
      if (this.variant === 'nut') {
        const geometry = this.createNutGeometry();
        const mesh = new THREE.Mesh(geometry, material);
        this.group.add(mesh);
      } else if (this.variant === 'bolt') {
        // Bolt needs head + shaft grouped
        const headGeometry = this.createBoltGeometry();
        const headMesh = new THREE.Mesh(headGeometry, material);
        headMesh.position.y = 1.5;
        this.group.add(headMesh);
        
        // Cylinder shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
        const shaftMesh = new THREE.Mesh(shaftGeometry, material);
        shaftMesh.position.y = -0.2;
        this.group.add(shaftMesh);
      } else { // screw
        const screwGroup = this.createScrewGeometry();
        // If it's a group, apply material to all meshes and add edge lines
        if (screwGroup instanceof THREE.Group) {
          screwGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = material;
              // Add edge geometry for vectorized look
              const edges = new THREE.EdgesGeometry(child.geometry);
              const edgeLines = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: '#1a1a1a', linewidth: 1 })
              );
              child.add(edgeLines);
            }
          });
          this.group.add(screwGroup);
        } else {
          const mesh = new THREE.Mesh(screwGroup, material);
          this.group.add(mesh);
        }
        
        // Rotate screw to diagonal orientation (head top-left, tip bottom-right)
        // This matches the image orientation
        this.group.rotation.z = Math.PI / 4; // 45 degrees
        this.group.rotation.x = Math.PI / 6; // 30 degrees for better 3D view
      }
      
      this.scene.add(this.group);
    }

    createNutGeometry() {
      // Create hex shape
      const hexShape = new THREE.Shape();
      const radius = 1.5;
      const points = 6;
      
      for (let i = 0; i <= points; i++) {
        const angle = (Math.PI / 3) * i;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) {
          hexShape.moveTo(x, y);
        } else {
          hexShape.lineTo(x, y);
        }
      }
      hexShape.closePath();
      
      // Create hole (inner circle)
      const holeRadius = 0.6;
      const hole = new THREE.Path();
      for (let i = 0; i <= 32; i++) {
        const angle = (Math.PI * 2 / 32) * i;
        const x = holeRadius * Math.cos(angle);
        const y = holeRadius * Math.sin(angle);
        if (i === 0) {
          hole.moveTo(x, y);
        } else {
          hole.lineTo(x, y);
        }
      }
      hole.closePath();
      hexShape.holes.push(hole);
      
      // Extrude
      const extrudeSettings = {
        depth: 0.8,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
      };
      
      return new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    }

    createBoltGeometry() {
      // For bolt, we'll return a group geometry indicator
      // The actual grouping will be handled in createGeometry
      // Hex head shape
      const hexShape = new THREE.Shape();
      const radius = 1.2;
      for (let i = 0; i <= 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) {
          hexShape.moveTo(x, y);
        } else {
          hexShape.lineTo(x, y);
        }
      }
      hexShape.closePath();
      
      const extrudeSettings = {
        depth: 0.6,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelSegments: 2
      };
      
      return new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    }

    createScrewGeometry() {
      // Create a more realistic screw with countersunk head, threaded shaft, and pointed tip
      const group = new THREE.Group();
      
      // Countersunk head (conical, wider at top)
      const headTopRadius = 0.7;
      const headBottomRadius = 0.35;
      const headHeight = 0.4;
      const headGeometry = new THREE.ConeGeometry(headTopRadius, headHeight, 16, 1, true);
      const headMesh = new THREE.Mesh(headGeometry);
      headMesh.position.y = 1.8;
      headMesh.rotation.z = Math.PI; // Flip to point down
      group.add(headMesh);
      
      // Flat top of head (circular cap)
      const capGeometry = new THREE.CylinderGeometry(headTopRadius, headTopRadius, 0.05, 16);
      const capMesh = new THREE.Mesh(capGeometry);
      capMesh.position.y = 2.0;
      group.add(capMesh);
      
      // Threaded shaft - create with visible threads
      const shaftLength = 3.0;
      const shaftRadius = 0.3;
      const threadDepth = 0.05;
      const threadPitch = 0.3; // Distance between threads
      
      // Create threaded shaft using a custom geometry
      const shaftSegments = 64;
      const shaftGeometry = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, shaftSegments);
      
      // Modify vertices to create thread pattern
      const positions = shaftGeometry.attributes.position;
      const vertexCount = positions.count;
      
      for (let i = 0; i < vertexCount; i++) {
        const y = positions.getY(i);
        const normalizedY = (y + shaftLength / 2) / shaftLength; // 0 to 1
        
        // Create thread pattern - alternating radius
        const threadPhase = (normalizedY * shaftLength) / threadPitch;
        const threadOffset = Math.sin(threadPhase * Math.PI * 2) * threadDepth;
        
        // Get current x and z
        const x = positions.getX(i);
        const z = positions.getZ(i);
        
        // Calculate angle and radius
        const angle = Math.atan2(z, x);
        const currentRadius = Math.sqrt(x * x + z * z);
        
        // Apply thread offset
        const newRadius = currentRadius + threadOffset;
        
        // Update position
        positions.setX(i, Math.cos(angle) * newRadius);
        positions.setZ(i, Math.sin(angle) * newRadius);
      }
      
      positions.needsUpdate = true;
      shaftGeometry.computeVertexNormals();
      
      const shaftMesh = new THREE.Mesh(shaftGeometry);
      shaftMesh.position.y = 0.2;
      group.add(shaftMesh);
      
      // Pointed tip (self-tapping point)
      const tipHeight = 0.4;
      const tipGeometry = new THREE.ConeGeometry(0.3, tipHeight, 8, 1, false);
      const tipMesh = new THREE.Mesh(tipGeometry);
      tipMesh.position.y = -1.4;
      tipMesh.rotation.z = Math.PI; // Point down
      group.add(tipMesh);
      
      // Merge all geometries into one
      const mergedGeometry = new THREE.BufferGeometry();
      const geometries = [headGeometry, capGeometry, shaftGeometry, tipGeometry];
      const matrices = [
        new THREE.Matrix4().makeTranslation(0, 1.8, 0).makeRotationZ(Math.PI),
        new THREE.Matrix4().makeTranslation(0, 2.0, 0),
        new THREE.Matrix4().makeTranslation(0, 0.2, 0),
        new THREE.Matrix4().makeTranslation(0, -1.4, 0).makeRotationZ(Math.PI)
      ];
      
      // For Three.js r160, we need to merge differently
      // Use BufferGeometryUtils if available, otherwise create a group
      // For now, return the group approach and handle in createGeometry
      return group;
    }

    animate() {
      if (this.isPaused || this.prefersReducedMotion) return;
      
      this.animationId = requestAnimationFrame(() => this.animate());
      
      if (this.group) {
        // Rotate on y-axis (east-west) instead of x-axis (north-south)
        if (this.variant === 'screw') {
          this.group.rotation.y += this.speed;
        } else {
          // Keep other variants rotating on x-axis
          this.group.rotation.x += this.speed;
        }
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    setupResize() {
      const resizeObserver = new ResizeObserver(() => {
        if (this.renderer && this.camera) {
          const rect = this.canvasContainer.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;
          
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      });
      
      resizeObserver.observe(this.canvasContainer);
      this.resizeObserver = resizeObserver;
    }

    pause() {
      this.isPaused = true;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    resume() {
      if (!this.prefersReducedMotion) {
        this.isPaused = false;
        this.animate();
      }
    }

    dispose() {
      // Clean up animation
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      // Clean up resize observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      
      // Clean up Three.js resources
      if (this.scene) {
        this.scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
    }
  }

  // Export for global use
  window.SpinningHardware3D = SpinningHardware3D;
})();

