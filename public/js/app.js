import { Globe } from './globe/Globe.js';
import { updateStats } from './utils/dataTransforms.js';

async function fetchArticlesFromBackend() {
    const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/articles' 
        : '/api/articles';
    const response = await fetch(apiUrl);
    return await response.json();
}

async function main() {
    const globe = new Globe();
    const articles = await fetchArticlesFromBackend();
    await updateStats(articles);
    await globe.addPoints(articles);
    globe.animate();
}

main();