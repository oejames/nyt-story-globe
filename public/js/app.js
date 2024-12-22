import Globe from './globe'
import API from './api'

async function main() {
    const globe = new Globe();
    const articles = await API.fetchArticles();
    
    await API.updateStats(articles);
    await globe.addPoints(articles);
    globe.animate();
}

main();