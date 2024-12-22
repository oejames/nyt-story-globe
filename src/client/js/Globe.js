import { latLongToVector3 } from '../utils/geoUtils.js';

export class Globe {
    constructor(radius = 5, textureUrl = './images/earth-living.jpg') {
        this.radius = radius;
        this.textureUrl = textureUrl;
        this.points = [];
        this.mesh = null;
        this.hoveredPoint = null;
    }

    init() {
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const texture = new THREE.TextureLoader().load(this.textureUrl);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        return this.mesh;
    }

    async addPoints(articles) {
        const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        for (const article of articles) {
            if (article.lat && article.lon) {
                const point = new THREE.Mesh(pointGeometry, pointMaterial);
                const position = latLongToVector3(article.lat, article.lon, this.radius);
                point.position.copy(position);
                point.userData = article;
                this.mesh.add(point);
                this.points.push(point);
            }
        }
    }

    updateHoveredPoint(intersectedPoint) {
        if (this.hoveredPoint !== intersectedPoint) {
            if (this.hoveredPoint) {
                this.hoveredPoint.material.color.setHex(0xff0000);
            }
            this.hoveredPoint = intersectedPoint;
            if (this.hoveredPoint) {
                this.hoveredPoint.material.color.setHex(0xffff00);
            }
        }
    }
}