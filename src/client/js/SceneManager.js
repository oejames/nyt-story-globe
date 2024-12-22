import { capitalizeLocation } from '../utils/geoUtils.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.mouse = null;
        this.tooltip = null;
        this.controls = null;
        this.lastClickTime = 0;
        this.doubleClickDelay = 300;
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;

        // Camera position
        this.camera.position.z = 15;

        // Raycaster and mouse setup
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Tooltip setup
        this.setupTooltip();

        // Event listeners
        this.setupEventListeners();

        return this;
    }

    setupTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.classList.add('tooltip');
        document.body.appendChild(this.tooltip);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('click', this.onClick.bind(this), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children[0].children);
        
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            
            // Check if the point is visible to the camera
            const pointPosition = intersectedObject.position.clone();
            const cameraDirection = this.camera.position.clone().sub(pointPosition).normalize();
            const pointDirection = pointPosition.clone().normalize();
            const dotProduct = cameraDirection.dot(pointDirection);
            
            if (dotProduct > 0) { // Point is on the visible side of the globe
                const article = intersectedObject.userData;
                const formattedLocation = article.location ? capitalizeLocation(article.location) : 'Unknown Location';
                const tooltipText = `${article.title}<br>${formattedLocation}`;
                
                // Update tooltip content and position
                this.tooltip.innerHTML = tooltipText;
                
                // Convert 3D position to 2D screen coordinates
                const vector = pointPosition.project(this.camera);
                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
                
                this.tooltip.style.left = `${x}px`;
                this.tooltip.style.top = `${y}px`;
                this.tooltip.style.display = 'block';
                this.renderer.domElement.style.cursor = 'pointer';
            } else {
                this.hideTooltip();
            }
        } else {
            this.hideTooltip();
        }
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
        this.renderer.domElement.style.cursor = 'default';
    }

    onClick(event) {
        const currentTime = new Date().getTime();
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children[0].children);
        
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (currentTime - this.lastClickTime < this.doubleClickDelay) {
                // Double click detected
                const article = intersectedObject.userData;
                if (article.url) {
                    window.open(article.url, '_blank');
                }
            }
            this.lastClickTime = currentTime;
        }
    }

    updateTooltip(intersection) {
        const article = intersection.object.userData;
        const pointPosition = intersection.object.position.clone();
        
        // Convert 3D position to 2D screen coordinates
        const vector = pointPosition.project(this.camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
        
        const formattedLocation = article.location ? capitalizeLocation(article.location) : 'Unknown Location';
        this.tooltip.innerHTML = `${article.title}<br>${formattedLocation}`;
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
        this.tooltip.style.display = 'block';
        this.renderer.domElement.style.cursor = 'pointer';
    }

    animate(globe) {
        requestAnimationFrame(() => this.animate(globe));
        
        // Update controls
        this.controls.update();
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(globe.mesh.children);
        
        if (intersects.length > 0) {
            const pointPosition = intersects[0].object.position.clone();
            const cameraDirection = this.camera.position.clone().sub(pointPosition).normalize();
            const pointDirection = pointPosition.clone().normalize();
            const dotProduct = cameraDirection.dot(pointDirection);
            
            if (dotProduct > 0) {
                globe.updateHoveredPoint(intersects[0].object);
                this.updateTooltip(intersects[0]);
            } else {
                globe.updateHoveredPoint(null);
                this.hideTooltip();
            }
        } else {
            globe.updateHoveredPoint(null);
            this.hideTooltip();
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Clean up method to remove event listeners and dispose of resources
    dispose() {
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('click', this.onClick.bind(this));
        
        this.controls.dispose();
        this.renderer.dispose();
        
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}