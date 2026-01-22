import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Data Structure ---
interface GraphNodeData {
  id: string;
  label: string;
  summary: string;
  position: [number, number, number];
  type: 'main' | 'sub';
  parentId?: string;
  connections: string[]; // IDs of connected nodes
}

// NOTE: This is the 3D diagram copied from `lace---contextual-engine`.
// It’s intentionally self-contained and uses local hard-coded data.
const DATA: GraphNodeData[] = [
  // --- Main Nodes ---
  {
    id: 'long-term',
    label: 'AI: Long-Term Implications',
    type: 'main',
    position: [0, 0, 0], // Center Nucleus
    connections: ['near-term', 'industrial', 'transformers'],
    summary:
      'This research examines how AI-driven labor automation fundamentally differs from traditional automation, focusing on its broader scope of impact across cognitive and strategic domains, its capacity to create entirely new industries and roles, and the complex feedback loops it generates within economic systems.',
  },
  {
    id: 'industrial',
    label: 'AI as Industrial Revolution 2.0',
    type: 'main',
    position: [12, 6, 10], // Elevated to upper-right-front quadrant
    connections: ['long-term', 'near-term'],
    summary:
      'This research examines AI as a general-purpose technology through the lens of economic history, drawing parallels to the Industrial Revolution while highlighting a critical distinction: the unprecedented speed of AI advancement compresses what were once generational transitions into individual career spans.',
  },
  {
    id: 'near-term',
    label: 'AI: Near-Term Impact',
    type: 'main',
    position: [-9, 9, 5], // Elevated to upper-left-front quadrant
    connections: ['long-term', 'industrial'],
    summary:
      'This research examines the societal implications of advanced AI systems, particularly foundation models built on transformer architecture, across three interconnected domains: labor market disruption, algorithmic bias, and healthcare implementation.',
  },
  {
    id: 'transformers',
    label: 'Intention & Transformers',
    type: 'main',
    position: [-6, -9, 10],
    connections: ['long-term'],
    summary:
      'This research traces how the transformer architecture, introduced in 2017, revolutionized AI through its attention mechanism, which enabled unprecedented parallelization and scaling across thousands of GPUs.',
  },

  // --- Satellites: Long-Term ---
  {
    id: 's1',
    label: 'Integration into Strategic Processes',
    type: 'sub',
    position: [4, 4, 2],
    parentId: 'long-term',
    connections: ['long-term'],
    summary: 'Analyzing high-level decision making loops.',
  },
  {
    id: 's2',
    label: 'Scope and Range of Impact',
    type: 'sub',
    position: [-4, -3, 2],
    parentId: 'long-term',
    connections: ['long-term'],
    summary: 'Mapping the breadth of cognitive labor displacement.',
  },
  {
    id: 's3',
    label: 'Creation of New Industries',
    type: 'sub',
    position: [3, -5, -3],
    parentId: 'long-term',
    connections: ['long-term'],
    summary: 'Emerging economic sectors post-automation.',
  },
  {
    id: 's4',
    label: '',
    type: 'sub',
    position: [-3, 5, -2],
    parentId: 'long-term',
    connections: ['long-term'],
    summary: 'Secondary derivative effects.',
  },

  // --- Satellites: Industrial ---
  {
    id: 's5',
    label: 'Labor Automation',
    type: 'sub',
    position: [15, 9, 8],
    parentId: 'industrial',
    connections: ['industrial'],
    summary: 'Historical parallels in workforce shifts.',
  },
  {
    id: 's6',
    label: 'Workforce Disruption',
    type: 'sub',
    position: [10, 3, 12],
    parentId: 'industrial',
    connections: ['industrial'],
    summary: 'Velocity of skill obsolescence.',
  },
  {
    id: 's7',
    label: '',
    type: 'sub',
    position: [14, 5, 13],
    parentId: 'industrial',
    connections: ['industrial'],
    summary: 'Capital accumulation metrics.',
  },

  // --- Satellites: Near-Term ---
  {
    id: 's8',
    label: 'Healthcare Implementation',
    type: 'sub',
    position: [-12, 12, 3],
    parentId: 'near-term',
    connections: ['near-term'],
    summary: 'Diagnostic acceleration vectors.',
  },
  {
    id: 's9',
    label: 'Regulatory Clarity',
    type: 'sub',
    position: [-6, 7, 2],
    parentId: 'near-term',
    connections: ['near-term'],
    summary: 'Global compliance frameworks.',
  },
  {
    id: 's10',
    label: '',
    type: 'sub',
    position: [-10, 11, 8],
    parentId: 'near-term',
    connections: ['near-term'],
    summary: 'Short-term volatility index.',
  },

  // --- Satellites: Transformers ---
  {
    id: 's11',
    label: 'AI Alignment',
    type: 'sub',
    position: [-9, -11, 8],
    parentId: 'transformers',
    connections: ['transformers'],
    summary: 'Steering objective functions.',
  },
  {
    id: 's12',
    label: 'Emergent Capabilities',
    type: 'sub',
    position: [-4, -7, 12],
    parentId: 'transformers',
    connections: ['transformers'],
    summary: 'Unpredicted scale-based behaviors.',
  },
  {
    id: 's13',
    label: 'Scaling Laws',
    type: 'sub',
    position: [-3, -12, 9],
    parentId: 'transformers',
    connections: ['transformers'],
    summary: 'Compute vs Performance ratios.',
  },
  {
    id: 's14',
    label: 'Foundation Models',
    type: 'sub',
    position: [-8, -8, 13],
    parentId: 'transformers',
    connections: ['transformers'],
    summary: 'Base layer cognitive infrastructure.',
  },
  {
    id: 's15',
    label: 'AGI',
    type: 'sub',
    position: [-5, -13, 11],
    parentId: 'transformers',
    connections: ['transformers'],
    summary: 'Theoretical convergence points.',
  },
];

interface Particle {
  sourceIndex: number;
  targetIndex: number;
  progress: number;
  speed: number;
  active: boolean;
}

export interface SemanticGraph3DProps {
  /**
   * Compact mode is intended for tiny "preview" embeds.
   * - disables click-to-select overlay
   * - lowers pixel ratio for perf
   */
  compact?: boolean;
}

export const SemanticGraph3D: React.FC<SemanticGraph3DProps> = ({ compact = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  // UI overlay (clicked node)
  const [selectedNodeData, setSelectedNodeData] = useState<GraphNodeData | null>(null);

  // Animation loop refs (avoid stale closures)
  const hoveredNodeIndexRef = useRef<number | null>(null);
  const selectedNodeIndexRef = useRef<number | null>(null);

  // Camera zoom/pan animation refs
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isZoomed = useRef(false);
  const isReturningHome = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const mount = mountRef.current;
    if (!container || !mount) return;

    // React StrictMode (dev) can mount/unmount/mount effects.
    // Be defensive: ensure only one renderer canvas exists (ONLY inside mount).
    while (mount.firstChild) mount.removeChild(mount.firstChild);

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 40);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1 : 2));
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = !compact;
    controls.maxDistance = 100;
    controls.minDistance = 5;

    // Better touch behavior on mobile devices.
    container.style.touchAction = 'none';

    // Cancel auto-return if user manually interacts
    controls.addEventListener('start', () => {
      isReturningHome.current = false;
    });

    // --- Interaction State ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(999, 999);
    let animationFrameId = 0;
    let disposed = false;

    // --- Helpers ---
    const createLabelSprite = (text: string, type: 'main' | 'sub') => {
      if (!text || type === 'sub') {
        const sprite = new THREE.Sprite();
        sprite.visible = false;
        return sprite;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1024;
      canvas.height = 128;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fontSize = 42;
        const weight = '400';

        ctx.font = `${weight} ${fontSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;

      const material = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });

      const sprite = new THREE.Sprite(material);
      const scale = 6;
      sprite.scale.set(scale * 2, scale * 0.25, 1);
      return sprite;
    };

    const createCircleTexture = (type: 'fill' | 'stroke') => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (type === 'fill') {
          const gradient = ctx.createRadialGradient(64, 64, 20, 64, 64, 60);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 128, 128);
        } else {
          ctx.beginPath();
          ctx.arc(64, 64, 62, 0, Math.PI * 2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    const haloTexture = createCircleTexture('fill');
    const ringTexture = createCircleTexture('stroke');

    // --- Objects ---
    const group = new THREE.Group();
    scene.add(group);

    const nodes: {
      mesh: THREE.Mesh;
      haloSprite: THREE.Sprite;
      ringSprite: THREE.Sprite;
      sprite: THREE.Sprite;
      initialPos: THREE.Vector3;
      velocity: THREE.Vector3;
      data: GraphNodeData;
    }[] = [];

    // Build Nodes
    DATA.forEach((data) => {
      const radius = data.type === 'main' ? 0.6 : 0.25;
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xe5e5e5 });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      const [x, y, z] = data.position;
      mesh.position.set(x, y, z);

      const haloMat = new THREE.SpriteMaterial({
        map: haloTexture,
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        depthTest: false,
      });
      const haloSprite = new THREE.Sprite(haloMat);
      haloSprite.position.set(x, y, z);
      haloSprite.renderOrder = 1;

      const ringMat = new THREE.SpriteMaterial({
        map: ringTexture,
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        depthTest: false,
      });
      const ringSprite = new THREE.Sprite(ringMat);
      ringSprite.position.set(x, y, z);
      ringSprite.renderOrder = 1;

      const sprite = createLabelSprite(data.label, data.type);
      sprite.position.set(x, y + (data.type === 'main' ? 1.2 : 0.6), z);
      sprite.renderOrder = 10;

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.0003,
        (Math.random() - 0.5) * 0.0003,
        (Math.random() - 0.5) * 0.0003
      );

      group.add(haloSprite);
      group.add(ringSprite);
      group.add(mesh);
      group.add(sprite);
      nodes.push({
        mesh,
        haloSprite,
        ringSprite,
        sprite,
        initialPos: new THREE.Vector3(x, y, z),
        velocity,
        data,
      });
    });

    // --- Connections (Edges) ---
    const idToIndex = new Map<string, number>();
    DATA.forEach((d, i) => idToIndex.set(d.id, i));

    const lineConnections: { idx1: number; idx2: number }[] = [];

    DATA.forEach((source, idx1) => {
      source.connections.forEach((targetId) => {
        const idx2 = idToIndex.get(targetId);
        if (idx2 !== undefined && idx2 > idx1) {
          lineConnections.push({ idx1, idx2 });
        } else if (idx2 !== undefined) {
          const reverseExists = lineConnections.some((c) => c.idx1 === idx2 && c.idx2 === idx1);
          if (!reverseExists) lineConnections.push({ idx1, idx2 });
        }
      });
    });

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lineGeo = new THREE.BufferGeometry();
    const lineCount = lineConnections.length;
    const linePositions = new Float32Array(lineCount * 6);
    const lineColors = new Float32Array(lineCount * 6);

    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(linesMesh);

    // --- Particles ---
    const particleCount = 30;
    const particleData: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particleData.push({ sourceIndex: 0, targetIndex: 0, progress: 0, speed: 0, active: false });
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particlesMesh);

    // --- Events ---
    const onPointerMove = (event: PointerEvent) => {
      if (disposed) return;
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      if (compact) return;
      if (hoveredNodeIndexRef.current !== null) {
        const idx = hoveredNodeIndexRef.current;
        if (nodes[idx].data.type === 'main') {
          selectedNodeIndexRef.current = idx;
          setSelectedNodeData(nodes[idx].data);

          // Zoom in
          targetLookAt.current.copy(nodes[idx].mesh.position);
          isZoomed.current = true;
          isReturningHome.current = false;
        }
      } else {
        // Deselect on background click
        if (selectedNodeIndexRef.current !== null) {
          targetLookAt.current.set(0, 0, 0);
          isReturningHome.current = true;
          isZoomed.current = false;
        }

        selectedNodeIndexRef.current = null;
        setSelectedNodeData(null);
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    // --- Animate ---
    const animate = () => {
      if (disposed) return;
      animationFrameId = window.requestAnimationFrame(animate);

      // Raycast
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(nodes.map((n) => n.mesh));

      let newHoveredIndex: number | null = null;
      for (const intersect of intersects) {
        const idx = nodes.findIndex((n) => n.mesh === intersect.object);
        if (idx !== -1 && nodes[idx].data.type === 'main') {
          newHoveredIndex = idx;
          break;
        }
      }

      hoveredNodeIndexRef.current = newHoveredIndex;
      if (!compact) {
        container.style.cursor = newHoveredIndex !== null ? 'pointer' : 'default';
      }

      // Stop rotation if interacting
      controls.autoRotate = compact ? true : newHoveredIndex === null && selectedNodeIndexRef.current === null;

      // --- Camera Animation (Zoom/Center) ---
      controls.target.lerp(targetLookAt.current, 0.04);

      if (isZoomed.current) {
        const ZOOM_DIST = 14;
        const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
        const targetPos = new THREE.Vector3().copy(controls.target).add(direction.multiplyScalar(ZOOM_DIST));
        camera.position.lerp(targetPos, 0.05);
      } else if (isReturningHome.current) {
        const homePos = new THREE.Vector3(0, 15, 40);
        camera.position.lerp(homePos, 0.015);
        if (camera.position.distanceTo(homePos) < 0.5) isReturningHome.current = false;
      }

      // Neighbors based on selection (not hover)
      const activeIndex = selectedNodeIndexRef.current;
      const hoveredIndex = hoveredNodeIndexRef.current;

      const selectedNeighbors = new Set<number>();
      if (activeIndex !== null) {
        selectedNeighbors.add(activeIndex);
        lineConnections.forEach((conn) => {
          if (conn.idx1 === activeIndex) selectedNeighbors.add(conn.idx2);
          if (conn.idx2 === activeIndex) selectedNeighbors.add(conn.idx1);
        });
      }

      // Update Nodes
      nodes.forEach((node, idx) => {
        // Physics drift - disable when zoomed
        if (!isZoomed.current) {
          node.mesh.position.add(node.velocity);
          const dist = node.mesh.position.distanceTo(node.initialPos);
          if (dist > 1.0) {
            const dir = new THREE.Vector3().subVectors(node.initialPos, node.mesh.position).normalize();
            node.velocity.add(dir.multiplyScalar(0.00001));
          }
        }

        node.haloSprite.position.copy(node.mesh.position);
        node.ringSprite.position.copy(node.mesh.position);
        node.sprite.position.copy(node.mesh.position);
        node.sprite.position.y += node.data.type === 'main' ? 1.2 : 0.6;

        // Visual logic
        const isSelected = idx === activeIndex;
        const isSelectedNeighbor = selectedNeighbors.has(idx);
        const isHovered = idx === hoveredIndex;

        const mat = node.mesh.material as THREE.MeshBasicMaterial;

        if (isSelected) {
          mat.color.setHex(0xffffff);
          node.haloSprite.visible = true;
          node.haloSprite.material.opacity = 0.25;
          node.haloSprite.scale.setScalar(3.5);

          node.ringSprite.visible = true;
          node.ringSprite.material.opacity = 0.9;
          node.ringSprite.scale.setScalar(1.8);

          node.sprite.material.color.setHex(0xffffff);
          node.sprite.material.opacity = 1.0;
          node.sprite.renderOrder = 999;
        } else if (isHovered) {
          mat.color.setHex(0xffffff);

          node.haloSprite.visible = true;
          node.haloSprite.material.opacity = 0.15;
          node.haloSprite.scale.setScalar(3.0);

          node.ringSprite.visible = true;
          node.ringSprite.material.opacity = 0.4;
          node.ringSprite.scale.setScalar(1.6);

          node.sprite.material.color.setHex(0xffffff);
          node.sprite.material.opacity = 1.0;
          node.sprite.renderOrder = 998;
        } else if (isSelectedNeighbor) {
          mat.color.setHex(0xffffff);

          node.haloSprite.visible = true;
          node.haloSprite.material.opacity = 0.1;
          node.haloSprite.scale.setScalar(node.data.type === 'main' ? 3.0 : 1.8);

          node.ringSprite.visible = false;

          node.sprite.material.color.setHex(0xccfbf1);
          node.sprite.material.opacity = 0.9;
          node.sprite.renderOrder = 100;
        } else {
          mat.color.setHex(0xe5e5e5);
          node.haloSprite.visible = false;
          node.ringSprite.visible = false;

          if (node.data.type === 'main') {
            node.sprite.material.color.setHex(0xffffff);
            node.sprite.material.opacity = 0.8;
          } else {
            node.sprite.material.color.setHex(0xa3a3a3);
            node.sprite.material.opacity = 0.5;
          }
          node.sprite.renderOrder = 0;
        }
      });

      // Update Lines
      const tealColor = new THREE.Color(0x22d3ee);
      let vIdx = 0;
      let cIdx = 0;

      const activeConnectionsForParticles: { idx1: number; idx2: number }[] = [];
      const time = Date.now() * 0.004;

      lineConnections.forEach((conn) => {
        const n1 = nodes[conn.idx1];
        const n2 = nodes[conn.idx2];

        linePositions[vIdx++] = n1.mesh.position.x;
        linePositions[vIdx++] = n1.mesh.position.y;
        linePositions[vIdx++] = n1.mesh.position.z;

        linePositions[vIdx++] = n2.mesh.position.x;
        linePositions[vIdx++] = n2.mesh.position.y;
        linePositions[vIdx++] = n2.mesh.position.z;

        let opacity = 0.45;
        if (activeIndex !== null) {
          if (conn.idx1 === activeIndex || conn.idx2 === activeIndex) {
            opacity = 0.8 + 0.2 * Math.sin(time);
            activeConnectionsForParticles.push(conn);
          } else {
            opacity = 0.05;
          }
        } else {
          opacity = 0.45;
          activeConnectionsForParticles.push(conn);
        }

        lineColors[cIdx++] = tealColor.r * opacity;
        lineColors[cIdx++] = tealColor.g * opacity;
        lineColors[cIdx++] = tealColor.b * opacity;

        lineColors[cIdx++] = tealColor.r * opacity;
        lineColors[cIdx++] = tealColor.g * opacity;
        lineColors[cIdx++] = tealColor.b * opacity;
      });

      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      // Update Particles
      if (Math.random() < 0.05 && activeConnectionsForParticles.length > 0) {
        const p = particleData.find((p) => !p.active);
        if (p) {
          const conn =
            activeConnectionsForParticles[Math.floor(Math.random() * activeConnectionsForParticles.length)];
          p.active = true;
          p.sourceIndex = conn.idx1;
          p.targetIndex = conn.idx2;
          p.progress = 0;
          p.speed = 0.005 + Math.random() * 0.01;
        }
      }

      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        if (p.active) {
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.active = false;
            particlePositions[i * 3] = 9999;
            particlePositions[i * 3 + 1] = 9999;
            particlePositions[i * 3 + 2] = 9999;
          } else {
            const n1 = nodes[p.sourceIndex].mesh.position;
            const n2 = nodes[p.targetIndex].mesh.position;
            particlePositions[i * 3] = n1.x + (n2.x - n1.x) * p.progress;
            particlePositions[i * 3 + 1] = n1.y + (n2.y - n1.y) * p.progress;
            particlePositions[i * 3 + 2] = n1.z + (n2.z - n1.z) * p.progress;
          }
        } else {
          particlePositions[i * 3] = 9999;
          particlePositions[i * 3 + 1] = 9999;
          particlePositions[i * 3 + 2] = 9999;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (disposed) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Also react to container size changes (layout shifts, responsive breakpoints).
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => handleResize()) : null;
    resizeObserver?.observe(container);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();

      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);

      controls.dispose();
      renderer.dispose();

      nodes.forEach((node) => {
        node.mesh.geometry.dispose();
        if (node.mesh.material instanceof THREE.Material) node.mesh.material.dispose();
        node.haloSprite.material.dispose();
        node.ringSprite.material.dispose();
        if (node.sprite.material.map) node.sprite.material.map.dispose();
        node.sprite.material.dispose();
      });

      lineGeo.dispose();
      lineMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      haloTexture.dispose();
      ringTexture.dispose();
    };
  }, [compact]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black/20">
      {/* Three.js mount point (canvas lives here) */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Executive summary overlay */}
      {!compact && selectedNodeData && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-3xl">
          <div className="relative p-5 border border-border bg-black/70 backdrop-blur-md">
            <div className="flex flex-col gap-3 items-start">
              <div className="w-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-mono font-semibold text-white tracking-tight">{selectedNodeData.label}</h3>
                  <div className="px-1.5 py-0.5 text-[9px] font-mono font-medium bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 uppercase tracking-wider">
                    {selectedNodeData.connections.length} Links
                  </div>
                </div>
                <p className="font-mono text-xs text-zinc-300 leading-relaxed opacity-90">{selectedNodeData.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_120%)] z-10" />
    </div>
  );
};

