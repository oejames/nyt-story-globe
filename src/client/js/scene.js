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

// Other functions (onWindowResize, onMouseMove, onClick, etc.) go here...
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
        
                // renderer.domElement.style.cursor = 'pointer';
                // const article = intersects[0].object.userData;
                // const formattedLocation = article.location ? capitalizeLocation(article.location) : 'Unknown Location';
                // const tooltipText = `${article.title}<br>${formattedLocation}`;
                // tooltip.innerHTML = tooltipText;
                // tooltip.style.left = `${event.clientX}px`;
                // tooltip.style.top = `${event.clientY}px`;
                // tooltip.style.display = 'block';
        
                // Check if the point is visible to the camera
                const pointPosition = intersectedObject.position.clone();
                const cameraDirection = camera.position.clone().sub(pointPosition).normalize();
                const pointDirection = pointPosition.clone().normalize();
                const dotProduct = cameraDirection.dot(pointDirection);
        
                if (dotProduct > 0) { // The point is on the visible side of the globe
                    const article = intersectedObject.userData;
                    const formattedLocation = article.location; // Keep using your formatted location logic
                    const tooltipText = `${article.title}<br>${formattedLocation}`;
                    tooltip.innerHTML = tooltipText;
        
                    // Updated logic to position tooltip based on 3D-to-2D projection
                    const vector = pointPosition.project(camera);
                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
        
                    tooltip.style.left = `${x}px`;
                    tooltip.style.top = `${y}px`;
                    tooltip.style.display = 'block';
                    renderer.domElement.style.cursor = 'pointer';
                } else {
                    // Hide tooltip if the point is on the opposite side
                    tooltip.style.display = 'none';
                    renderer.domElement.style.cursor = 'default';
                }
            } else {
                // Original logic for when no intersections are detected
                tooltip.style.display = 'none';
                renderer.domElement.style.cursor = 'default';
            }
        }
        

        let lastClickTime = 0;
        const doubleClickDelay = 300; // milliseconds
        
        function onClick(event) {
            const currentTime = new Date().getTime();
            if (hoveredPoint) {
                if (currentTime - lastClickTime < doubleClickDelay) {
                    // Double click detected, open the URL
                    window.open(hoveredPoint.userData.url, '_blank');
                }
                lastClickTime = currentTime;
            }
        }

        function latLongToVector3(lat, lon, radius) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = (radius * Math.sin(phi) * Math.sin(theta));
            const y = (radius * Math.cos(phi));
            return new THREE.Vector3(x, y, z);
        }

        async function addPoints(articles) {
            const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32); // could maybe increase size
            const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

            for (const article of articles) {
                if (article.lat && article.lon) { // making sure lat and lon are present
                // const coords = await getGeocode(article.location);
                // if (coords) {
                    const point = new THREE.Mesh(pointGeometry, pointMaterial);
                    // const position = latLongToVector3(coords[0], coords[1], 5);
                    const position = latLongToVector3(article.lat, article.lon, 5);
                    point.position.copy(position);
                    point.userData = article;
                    globe.add(point);
                }
            }
        }
        // }

        function animate() {
            requestAnimationFrame(animate);
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(globe.children);

            if (intersects.length > 0) {
                const article = intersects[0].object.userData;
                // infoDiv.innerHTML = `<a href="${article.url}" target="_blank">${article.title}<br>${article.location}</a>`;
                // infoDiv.style.display = 'block';
                
                if (hoveredPoint !== intersects[0].object) {
                    if (hoveredPoint) hoveredPoint.material.color.setHex(0xff0000);
                    hoveredPoint = intersects[0].object;
                    
                    // hoveredPoint.material.color.setHex(0xffff00);
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