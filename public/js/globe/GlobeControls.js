export class GlobeControls {
    constructor(camera, renderer) {
        this.controls = new THREE.OrbitControls(camera, renderer.domElement);
        this.setupControls();
    }

    setupControls() {
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
    }
}