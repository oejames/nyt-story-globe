import { SceneManager } from './SceneManager.js';
import { Globe } from './Globe.js';
import { fetchArticles } from './api.js';

async function main() {
    const sceneManager = new SceneManager();
    sceneManager.init();

    const globe = new Globe();
    const globeMesh = globe.init();
    sceneManager.scene.add(globeMesh);

    try {
        const articles = await fetchArticles();
        await globe.addPoints(articles);
        sceneManager.animate(globe);
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

main();