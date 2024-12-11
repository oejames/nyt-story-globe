let scene, camera, renderer, globe, raycaster, mouse, infoDiv;
let hoveredPoint = null;

function capitalizeLocation(location) {
    return location
        .split(' ')
        .map(word => {
            let firstLetterIndex = word.search(/[a-zA-Z]/);
            if (firstLetterIndex === -1) return word;
            return word.slice(0, firstLetterIndex) + 
                word.charAt(firstLetterIndex).toUpperCase() + 
                word.slice(firstLetterIndex + 1).toLowerCase();
        })
        .join(' ');
}

async function fetchArticlesFromBackend() {
    const apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/articles' 
    : '/api/articles';
    const response = await fetch(apiUrl);
    return await response.json();
}

// Initialize and render the globe
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

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('click', onClick, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

async function addPoints(articles) {
    const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    for (const article of articles) {
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        const position = latLongToVector3(article.lat, article.lon, 5);
        point.position.copy(position);
        point.userData = article;
        globe.add(point);
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
        if (hoveredPoint) {
            hoveredPoint.material.color.setHex(0xff0000);
            hoveredPoint = null;
        }
    }

    renderer.render(scene, camera);
}

async function main() {
    init();
    const articles = await fetchArticlesFromBackend();
    await addPoints(articles);
    animate();
}

main();
