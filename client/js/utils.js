function extractFirstLocations(articles) {
    return articles.map(article => {
        const keywords = article.keywords.filter(k => k.name === 'glocations');
        return {
            title: article.headline.main,
            location: keywords.length > 0 ? keywords[0].value : null,
            url: article.web_url
        };
    }).filter(article => article.location !== null);
}

function capitalizeLocation(location) { 
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

async function getGeocode(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}

function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
}

export {
    extractFirstLocations,
    capitalizeLocation,
    getGeocode,
    latLongToVector3
};