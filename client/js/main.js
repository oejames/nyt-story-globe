import { init, addPoints, animate } from './scene.js';

async function fetchArticlesFromBackend() {
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

main();