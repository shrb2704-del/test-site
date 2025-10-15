const scene = new THREE.Scene();
const saturnScene = new THREE.Scene();
const earthContainer = document.getElementById('scene-container');
const saturnContainer = document.getElementById('saturn-container');
const clock = new THREE.Clock();

// Earth Renderer
const earthRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
earthRenderer.setSize(1200, 1200);
earthContainer.appendChild(earthRenderer.domElement);

// Saturn Renderer
const saturnRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
saturnRenderer.setSize(1200, 1200);
saturnContainer.appendChild(saturnRenderer.domElement);

// Cameras
const earthCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
earthCamera.position.set(0, 0, 100);

const saturnCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
saturnCamera.position.set(0, 0, 80);

// Lighting
const earthAmbientLight = new THREE.AmbientLight(0x333333, 0.4);
scene.add(earthAmbientLight);
const earthDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
earthDirectionalLight.position.set(5, 3, 5);
scene.add(earthDirectionalLight);

const saturnAmbientLight = new THREE.AmbientLight(0x333333, 0.4);
saturnScene.add(saturnAmbientLight);
const saturnDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
saturnDirectionalLight.position.set(5, 3, 5);
saturnScene.add(saturnDirectionalLight);

// Earth setup
const earthGeometry = new THREE.SphereGeometry(60, 64, 64);
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const earthCloudGeometry = new THREE.SphereGeometry(60.4, 64, 64);
const earthCloudTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_2048.png');
const earthCloudMaterial = new THREE.MeshPhongMaterial({
    map: earthCloudTexture,
    transparent: true,
    opacity: 0.4
});
const earthClouds = new THREE.Mesh(earthCloudGeometry, earthCloudMaterial);
earth.add(earthClouds);
earth.position.set(40, 0, 0);

// Saturn setup
const saturnGeometry = new THREE.SphereGeometry(35, 128, 128);
const saturnMaterial = new THREE.MeshPhongMaterial({ color: 0xb5a48b });
const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
saturnScene.add(saturn);

textureLoader.load(
    'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
    (texture) => {
        texture.anisotropy = saturnRenderer.capabilities.getMaxAnisotropy();
        saturnMaterial.map = texture;
        saturnMaterial.needsUpdate = true;
    }
);

const ringGeometry = new THREE.TorusGeometry(55, 8, 3, 128);
const ringMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
});
const rings = new THREE.Mesh(ringGeometry, ringMaterial);
rings.rotation.x = Math.PI / 2.5;
saturn.add(rings);

textureLoader.load(
    'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png',
    (texture) => {
        texture.anisotropy = saturnRenderer.capabilities.getMaxAnisotropy();
        ringMaterial.map = texture;
        ringMaterial.needsUpdate = true;
    }
);

saturn.position.set(-60, 0, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    earth.rotation.y += 0.0025;
    saturn.rotation.y += 0.0015;
    earthRenderer.render(scene, earthCamera);
    saturnRenderer.render(saturnScene, saturnCamera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    const width = 1200;
    const height = 1200;
    earthCamera.aspect = width / height;
    earthCamera.updateProjectionMatrix();
    earthRenderer.setSize(width, height);
    saturnCamera.aspect = width / height;
    saturnCamera.updateProjectionMatrix();
    saturnRenderer.setSize(width, height);
});

// Stars generation
const starsContainer = document.getElementById('stars');
const starCount = 300;
for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 40}s`;
    starsContainer.appendChild(star);
}