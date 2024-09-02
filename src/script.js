import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import { API_KEY } from './config.js';

const apiKey = API_KEY;
const mongoUrl = 'mongodb://127.0.0.1:27017';
const pagesPerRun = 5; 
const delayBetweenRuns = 60000; // 1 minute delay

async function fetchModernLoveArticles(page = 0) {
    console.log(`Fetching articles from page ${page}...`);
    const query = 'modern love';
    try {
        const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=column:("Modern Love")&api-key=${apiKey}&page=${page}`);


        const data = await response.json();
        console.log(`Fetched ${data.response.docs.length} articles from page ${page}.`);
        return data.response.docs;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

function extractLocations(articles) {
    console.log('Extracting locations from articles...');
    const locations = articles.map(article => {
        const keywords = article.keywords.filter(k => k.name === 'glocations');
        return {
            title: article.headline.main,
            location: keywords.length > 0 ? keywords[0].value : null,
            url: article.web_url
        };
    }).filter(article => article.location !== null);
    console.log(`Extracted ${locations.length} locations.`);
    return locations;
}

async function getGeocode(location) {
    console.log(`Geocoding location: ${location}...`);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const data = await response.json();
        if (data.length > 0) {
            console.log(`Geocoded ${location} to [${data[0].lat}, ${data[0].lon}]`);
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            console.log(`No geocode found for ${location}.`);
            return null;
        }
    } catch (error) {
        console.error('Error getting geocode:', error);
        return null;
    }
}

async function updateArticleGeocode(articleId, lat, lon) {
    console.log(`Updating article ${articleId} with geocode [${lat}, ${lon}]...`);
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('modern_love_articles');
        const collection = database.collection('articles');
        await collection.updateOne(
            { _id: articleId },
            { $set: { lat, lon } }
        );
        console.log(`Updated article ${articleId} with geocode [${lat}, ${lon}].`);
    } catch (error) {
        console.error('Error updating article geocode:', error);
    } finally {
        await client.close();
    }
}

async function storeArticlesInMongoDB(articles) {
    console.log(`Storing ${articles.length} articles in MongoDB...`);
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('modern_love_articles');
        const collection = database.collection('articles');

        for (const article of articles) {
            const existingArticle = await collection.findOne({ url: article.url });
            if (existingArticle) {
                console.log(`Article with URL ${article.url} already exists. Updating geocode...`);
                await updateArticleGeocode(existingArticle._id, article.lat, article.lon);
            } else {
                console.log(`Inserting new article with URL ${article.url}.`);
                await collection.insertOne(article);
                console.log(`Inserted article with URL ${article.url}.`);
            }
        }
    } catch (error) {
        console.error('Error storing articles in MongoDB:', error);
    } finally {
        await client.close();
    }
}

async function fetchAndStoreArticles(startPage) {
    console.log(`Starting to fetch and store articles from page ${startPage}...`);
    let page = startPage;
    let moreArticlesAvailable = true;

    while (moreArticlesAvailable) {
        let allArticles = [];
        let currentPage = page;

        for (let i = 0; i < pagesPerRun; i++) {
            console.log(`Fetching articles from page ${currentPage}...`);
            const articles = await fetchModernLoveArticles(currentPage);
            if (articles.length > 0) {
                allArticles = allArticles.concat(articles);
                currentPage += 1;
            } else {
                moreArticlesAvailable = false;
                break;
            }
        }

        if (allArticles.length > 0) {
            const locatedArticles = extractLocations(allArticles);

            for (const article of locatedArticles) {
                if (!article.lat || !article.lon) {
                    console.log(`Geocoding article location: ${article.location}...`);
                    const coords = await getGeocode(article.location);
                    if (coords) {
                        article.lat = coords[0];
                        article.lon = coords[1];
                    }
                }
            }

            await storeArticlesInMongoDB(locatedArticles);
        }

        if (moreArticlesAvailable) {
            console.log(`Waiting ${delayBetweenRuns / 1000} seconds before the next run...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenRuns));
        }

        page = currentPage;
    }
}

(async function main() {
    console.log('Script started.');
    const startPage = 0; 
    await fetchAndStoreArticles(startPage);
    console.log('Script finished.');
})();
