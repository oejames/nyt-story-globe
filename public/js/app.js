async function fetchArticles() {
    const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/articles' 
        : '/api/articles';
    const response = await fetch(apiUrl);
    return response.json();
}

async function updateStats(articles) {
    const storiesWithLocation = articles.filter(article => article.lat && article.lon).length;
    document.getElementById('story-count').textContent = storiesWithLocation;

    const uniqueRegions = new Set();
    articles.forEach(article => {
        if (article.lat && article.lon) {
            const regionKey = `${Math.round(article.lat)},${Math.round(article.lon)}`;
            uniqueRegions.add(regionKey);
        }
    });
    document.getElementById('country-count').textContent = uniqueRegions.size;
}

async function main() {
    const globe = new Globe();
    globe.init();
    
    const articles = await fetchArticles();
    await updateStats(articles);
    globe.addPoints(articles);
    globe.animate();
}

main();