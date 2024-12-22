import { GlobeControls } from './GlobeControls.js';
import { Points } from './Points.js';

export class Globe {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.setupScene();
        this.controls = new GlobeControls(this.camera, this.renderer);
        this.points = new Points();
        this.setupEventListeners();
    }

    setupScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const texture = new THREE.TextureLoader().load('./images/earth-living.jpg');
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        this.camera.position.z = 15;
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async addPoints(articles) {
        await this.points.addToGlobe(articles, this.globe);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.points.update(this.camera);
        this.renderer.render(this.scene, this.camera);
    }
}