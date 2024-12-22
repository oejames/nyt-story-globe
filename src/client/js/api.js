export async function fetchArticles() {
    const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/articles' 
        : '/api/articles';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const articles = await response.json();
        return articles;
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
}