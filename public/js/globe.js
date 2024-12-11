import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls.js';

// Initialize Three.js scene, camera, renderer, and globe
export function initThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add the globe
    const globe = createGlobe();
    scene.add(globe);

    // Set up camera and controls
    camera.position.z = 15;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = false;

    return { scene, camera, renderer, globe };
}

// Create the 3D globe
function createGlobe() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const texture = new THREE.TextureLoader().load('./images/earth-living.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
}

// Add points to the globe based on article data
export async function addPoints(articles, globe) {
    const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (const article of articles) {
        const position = latLongToVector3(article.lat, article.lon, 5);
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.copy(position);
        point.userData = article;
        globe.add(point);
    }
}

// Convert latitude and longitude to a 3D position on the globe
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
}

// Animation loop for rendering the scene
export function animate(scene, camera, renderer, globe) {
    requestAnimationFrame(() => animate(scene, camera, renderer, globe));

    // Render the scene
    renderer.render(scene, camera);
}
