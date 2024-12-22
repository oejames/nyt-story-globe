export function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
}

export function capitalizeLocation(location) {
    return location
        .split(' ')
        .map(word => {
            let firstLetterIndex = word.search(/[a-zA-Z]/);
            if (firstLetterIndex === -1) return word;
            return word.slice(0, firstLetterIndex) + 
                word.charAt(firstLetterIndex).toUpperCase() + 
                word.slice(firstLetterIndex + 1).toLowerCase();
        })
        .join(' ');
}

export async function updateStats(articles) {
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