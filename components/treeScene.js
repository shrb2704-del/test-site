import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

function createOrnaments(group) {
  const ornamentPositions = [
    [0.6, 1.8, 0.4],
    [-0.4, 1.4, 0.6],
    [0.3, 1.0, -0.7],
    [-0.6, 0.6, -0.5]
  ];
  const colors = ['#ff7aa2', '#ffd76f', '#7bd8ff', '#b7ff6b'];
  const ornaments = [];

  ornamentPositions.forEach(([x, y, z], idx) => {
    const geo = new THREE.SphereGeometry(0.12, 18, 18);
    const mat = new THREE.MeshStandardMaterial({
      color: colors[idx % colors.length],
      emissive: colors[idx % colors.length],
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.35
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    ornaments.push(mesh);
    group.add(mesh);
  });

  return ornaments;
}

function createLights(scene) {
  const ambient = new THREE.AmbientLight('#dff5ff', 0.65);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight('#c0e8ff', 1.0);
  dir.position.set(3, 6, 5);
  dir.castShadow = true;
  scene.add(dir);

  const point = new THREE.PointLight('#8de6ff', 1.0, 8);
  point.position.set(-2, 2, 2);
  scene.add(point);
}

function createTree() {
  const group = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.32, 0.9, 12);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#8b5a2b',
    roughness: 0.9
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = -0.35;
  group.add(trunk);

  const layers = [];
  const cones = [
    { radius: 1.2, height: 1.6, y: 0.5 },
    { radius: 1.0, height: 1.4, y: 1.2 },
    { radius: 0.8, height: 1.2, y: 1.8 }
  ];

  const leafMat = new THREE.MeshStandardMaterial({
    color: '#1ea36f',
    roughness: 0.4,
    metalness: 0.05
  });

  cones.forEach(({ radius, height, y }) => {
    const coneGeo = new THREE.ConeGeometry(radius, height, 24);
    const cone = new THREE.Mesh(coneGeo, leafMat);
    cone.position.y = y;
    cone.castShadow = true;
    cone.receiveShadow = true;
    group.add(cone);
    layers.push(cone);
  });

  const starGeo = new THREE.IcosahedronGeometry(0.25, 0);
  const starMat = new THREE.MeshStandardMaterial({
    color: '#ffe66d',
    emissive: '#ffe66d',
    emissiveIntensity: 0.8,
    roughness: 0.2
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.y = 2.6;
  group.add(star);

  const ornaments = createOrnaments(group);

  return { group, trunk, layers, ornaments, star };
}

function scatterParts(parts) {
  const randomOffset = () => (Math.random() - 0.5) * 1.8;
  const layers = [...parts.layers, parts.trunk, ...parts.ornaments, parts.star];
  layers.forEach((mesh) => {
    mesh.userData.target = mesh.userData.target || mesh.position.clone();
    mesh.userData.start = mesh.position.clone();
    mesh.position.x = mesh.userData.target.x + randomOffset();
    mesh.position.y = mesh.userData.target.y + Math.random() * 1.4 + 0.3;
    mesh.position.z = mesh.userData.target.z + randomOffset();
    mesh.userData.scatter = mesh.position.clone();
  });
}

function setTargets(parts) {
  [parts.trunk, ...parts.layers, ...parts.ornaments, parts.star].forEach((mesh) => {
    mesh.userData.target = mesh.position.clone();
  });
}

export function createTreeScene(container) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#081021', 0.065);

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 5.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  createLights(scene);
  const groundGeo = new THREE.CircleGeometry(6, 48);
  const groundMat = new THREE.MeshStandardMaterial({ color: '#0f1f36', roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.8;
  ground.receiveShadow = true;
  scene.add(ground);

  const treeParts = createTree();
  scene.add(treeParts.group);
  setTargets(treeParts);
  scatterParts(treeParts);

  const clock = new THREE.Clock();
  let assembled = false;
  let targetState = 'scatter';

  function animate() {
    const delta = clock.getDelta();
    const ease = Math.min(delta * 2.2, 0.18);

    [treeParts.trunk, ...treeParts.layers, ...treeParts.ornaments, treeParts.star].forEach((mesh) => {
      const target = targetState === 'assemble' ? mesh.userData.target : mesh.userData.scatter;
      if (!mesh.userData.scatter) {
        mesh.userData.scatter = mesh.position.clone();
      }
      if (target) {
        mesh.position.lerp(target, ease);
      }
      mesh.rotation.y += 0.12 * delta;
    });

    renderer.render(scene, camera);
  }

  function setState(nextState) {
    targetState = nextState;
    assembled = nextState === 'assemble';
    [treeParts.trunk, ...treeParts.layers, ...treeParts.ornaments, treeParts.star].forEach((mesh) => {
      if (!mesh.userData.scatter) {
        mesh.userData.scatter = mesh.position.clone();
      }
    });
  }

  function assembleTree() {
    setState('assemble');
  }

  function scatterTree() {
    scatterParts(treeParts);
    setState('scatter');
  }

  let animationId;
  function loop() {
    animate();
    animationId = requestAnimationFrame(loop);
  }
  loop();

  function onResize() {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }
  window.addEventListener('resize', onResize);

  return {
    assembleTree,
    scatterTree,
    isAssembled: () => assembled,
    dispose() {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
