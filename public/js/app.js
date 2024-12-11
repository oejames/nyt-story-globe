import { initThreeJS, addPoints, animate } from './globe.js';

let scene, camera, renderer, globe;

async function fetchArticlesFromBackend() {
    const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/articles' 
        : '/api/articles';
        
    const response = await fetch(apiUrl);
    const articles = await response.json();
    return articles;
}

async function main() {
    // Initialize Three.js components (scene, camera, globe, etc.)
    ({ scene, camera, renderer, globe } = initThreeJS());

    // Fetch article data from the backend
    const articles = await fetchArticlesFromBackend();
    
    // Add points for each article on the globe
    await addPoints(articles, globe);

    // Start the animation loop
    animate(scene, camera, renderer, globe);
}

main();
