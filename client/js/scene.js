import { latLongToVector3, capitalizeLocation } from './utils.js';

let scene, camera, renderer, globe, raycaster, mouse, infoDiv, tooltip;
let hoveredPoint = null;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = false;

    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const texture = new THREE.TextureLoader().load('./images/earth-living.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    camera.position.z = 15;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    infoDiv = document.getElementById('info');

    tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('click', onClick, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(globe.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const pointPosition = intersectedObject.position.clone();
        const cameraDirection = camera.position.clone().sub(pointPosition).normalize();
        const pointDirection = pointPosition.clone().normalize();
        const dotProduct = cameraDirection.dot(pointDirection);

        if (dotProduct > 0) {
            const article = intersectedObject.userData;
            const formattedLocation = article.location;
            const tooltipText = `${article.title}<br>${formattedLocation}`;
            tooltip.innerHTML = tooltipText;

            const vector = pointPosition.project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            tooltip.style.display = 'block';
            renderer.domElement.style.cursor = 'pointer';
        } else {
            tooltip.style.display = 'none';
            renderer.domElement.style.cursor = 'default';
        }
    } else {
        tooltip.style.display = 'none';
        renderer.domElement.style.cursor = 'default';
    }
}

let lastClickTime = 0;
const doubleClickDelay = 300;

function onClick(event) {
    const currentTime = new Date().getTime();
    if (hoveredPoint) {
        if (currentTime - lastClickTime < doubleClickDelay) {
            window.open(hoveredPoint.userData.url, '_blank');
        }
        lastClickTime = currentTime;
    }
}

async function addPoints(articles) {
    const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (const article of articles) {
        if (article.lat && article.lon) {
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            const position = latLongToVector3(article.lat, article.lon, 5);
            point.position.copy(position);
            point.userData = article;
            globe.add(point);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(globe.children);

    if (intersects.length > 0) {
        const article = intersects[0].object.userData;
        
        if (hoveredPoint !== intersects[0].object) {
            if (hoveredPoint) hoveredPoint.material.color.setHex(0xff0000);
            hoveredPoint = intersects[0].object;
        }
    } else {
        infoDiv.style.display = 'none';
        if (hoveredPoint) {
            hoveredPoint.material.color.setHex(0xff0000);
            hoveredPoint = null;
        }
    }

    renderer.render(scene, camera);
}

export {
    init,
    addPoints,
    animate
};