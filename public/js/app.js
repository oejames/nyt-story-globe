let scene, camera, renderer, globe, raycaster, mouse, infoDiv;
let hoveredPoint = null;

// Extract location functions, init, event handlers, etc.
function extractFirstLocations(articles) {
    return articles.map(article => {
        const keywords = article.keywords.filter(k => k.name === 'glocations');
        return {
            title: article.headline.main,
            location: keywords.length > 0 ? keywords[0].value : null,
            url: article.web_url
        };
    }).filter(article => article.location !== null);
}

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

async function getGeocode(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}

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

            // if (intersects.length > 0) {
            //     renderer.domElement.style.cursor = 'pointer';
            // } else {
            //     renderer.domElement.style.cursor = 'default';
            // }
            if (intersects.length > 0) {
                const article = intersects[0].object.userData;
                const formattedLocation = article.location ? capitalizeLocation(article.location) : 'Unknown Location';
                const tooltipText = `${article.title}<br>${formattedLocation}`;
                // const tooltipText = `${article.title}<br>${article.location}`;
                tooltip.innerHTML = tooltipText;
                
                    // convert the 3D position of the point to 2D screen coordinates
                    const vector = intersects[0].object.position.clone();
                    vector.project(camera);

                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

                    tooltip.style.left = `${x}px`;
                    tooltip.style.top = `${y}px`;
                    tooltip.style.display = 'block';
                    // tooltip.style.left = `${event.clientX}px`;
                    // tooltip.style.top = `${event.clientY}px`;
                    // tooltip.style.display = 'block';
                renderer.domElement.style.cursor = 'pointer';
            } else {
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

        async function fetchArticlesFromBackend() {
    // const response = await fetch('http://localhost:3000/api/articles');
    const apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/articles' 
    : '/api/articles';

    const response = await fetch(apiUrl);

    const articles = await response.json();
    return articles;
}

async function main() {
    init();
    
    const articles = await fetchArticlesFromBackend();
    
    await addPoints(articles);
    
    animate();
}


        // async function main() { // og 
        //     init();
        //     let allArticles = [];
        //     let page = 0;

        //     while (page < 1) {
        //         const articles = await fetchModernLoveArticles(page);
        //         if (articles.length > 0) {
        //             allArticles = allArticles.concat(articles);
        //             page += 1;
        //         }
        //     }

        //     const locatedArticles = extractLocations(allArticles);
        //     await addPoints(locatedArticles);
        //     const moreLocatedArticles = extractFirstLocations(allArticles);
        //     await addPoints(moreLocatedArticles);
        //     animate();
        // }

        main();