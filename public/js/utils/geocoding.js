export async function getGeocode(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}
