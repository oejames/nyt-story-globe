import { latLongToVector3 } from '../utils/dataTransforms.js';

export class Points {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPoint = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('click', this.onClick.bind(this));
    }

    async addToGlobe(articles, globe) {
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

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(event) {
        if (this.hoveredPoint) {
            window.open(this.hoveredPoint.userData.url, '_blank');
        }
    }

    update(camera) {
        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects(this.globe.children);

        if (intersects.length > 0) {
            const point = intersects[0].object;
            if (this.hoveredPoint !== point) {
                if (this.hoveredPoint) {
                    this.hoveredPoint.material.color.setHex(0xff0000);
                }
                this.hoveredPoint = point;
                this.hoveredPoint.material.color.setHex(0xffff00);
                this.updateTooltip(point);
            }
        } else {
            if (this.hoveredPoint) {
                this.hoveredPoint.material.color.setHex(0xff0000);
                this.hoveredPoint = null;
                this.hideTooltip();
            }
        }
    }

    updateTooltip(point) {
        const tooltip = document.querySelector('.tooltip');
        const article = point.userData;
        tooltip.innerHTML = `${article.title}<br>${article.location}`;
        
        const vector = point.position.clone();
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        tooltip.style.display = 'none';
    }
}