class Globe {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.globe = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPoint = null;
        this.tooltip = null;
        this.lastClickTime = 0;
        this.doubleClickDelay = 300;

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.enablePan = false;

        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const texture = new THREE.TextureLoader().load('./images/earth-living.jpg');
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        this.camera.position.z = 15;

        this.tooltip = document.createElement('div');
        this.tooltip.classList.add('tooltip');
        document.body.appendChild(this.tooltip);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', (e) => this.onClick(e));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.updateTooltip();
    }

    onClick(event) {
        const currentTime = new Date().getTime();
        if (this.hoveredPoint && currentTime - this.lastClickTime < this.doubleClickDelay) {
            window.open(this.hoveredPoint.userData.url, '_blank');
        }
        this.lastClickTime = currentTime;
    }

    updateTooltip() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.globe.children);

        if (intersects.length > 0) {
            const article = intersects[0].object.userData;
            const formattedLocation = article.location ? this.capitalizeLocation(article.location) : 'Unknown Location';
            
            const vector = intersects[0].object.position.clone();
            vector.project(this.camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

            this.tooltip.innerHTML = `${article.title}<br>${formattedLocation}`;
            this.tooltip.style.left = `${x}px`;
            this.tooltip.style.top = `${y}px`;
            this.tooltip.style.display = 'block';
            this.renderer.domElement.style.cursor = 'pointer';
        } else {
            this.tooltip.style.display = 'none';
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    capitalizeLocation(location) {
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

    async addPoints(articles) {
        const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        for (const article of articles) {
            if (article.lat && article.lon) {
                const point = new THREE.Mesh(pointGeometry, pointMaterial);
                const position = this.latLongToVector3(article.lat, article.lon, 5);
                point.position.copy(position);
                point.userData = article;
                this.globe.add(point);
            }
        }
    }

    latLongToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateTooltip();
        this.renderer.render(this.scene, this.camera);
    }
}