import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import { API_KEY } from './config.js';

const apiKey = API_KEY;
const mongoUrl = 'mongodb://localhost:27017'; // MongoDB connection URL
const pagesPerRun = 3; // Number of pages to fetch per run
const delayBetweenRuns = 60000; // Delay between runs in milliseconds (e.g., 1 minute)

async function fetchModernLoveArticles(page = 0) {
    const query = 'modern love';
    const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${apiKey}&page=${page}`);
    const data = await response.json();
    return data.response.docs;
}

function extractLocations(articles) {
    return articles.map(article => {
        const keywords = article.keywords.filter(k => k.name === 'glocations');
        return {
            title: article.headline.main,
            location: keywords.length > 0 ? keywords[0].value : null,
            url: article.web_url
        };
    }).filter(article => article.location !== null);
}

async function getGeocode(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}

async function updateArticleGeocode(articleId, lat, lon) {
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
    } finally {
        await client.close();
    }
}

async function storeArticlesInMongoDB(articles) {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('modern_love_articles');
        const collection = database.collection('articles');

        // Insert or update articles in MongoDB
        for (const article of articles) {
            const existingArticle = await collection.findOne({ url: article.url });
            if (existingArticle) {
                // Update existing article
                await updateArticleGeocode(existingArticle._id, article.lat, article.lon);
            } else {
                // Insert new article
                await collection.insertOne(article);
                console.log(`Inserted article with URL ${article.url}.`);
            }
        }
    } finally {
        await client.close();
    }
}

async function fetchAndStoreArticles(startPage) {
    let page = startPage;
    let moreArticlesAvailable = true;

    while (moreArticlesAvailable) {
        let allArticles = [];
        let currentPage = page;

        // Fetch multiple pages
        for (let i = 0; i < pagesPerRun; i++) {
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

            // Geocode locations and update the database
            for (const article of locatedArticles) {
                if (!article.lat || !article.lon) { // Check if geocode is already present
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
    const startPage = 0; // Start from page 0 or any specific page
    await fetchAndStoreArticles(startPage);
})();

// import fetch from 'node-fetch';
// import { MongoClient } from 'mongodb';
// import { API_KEY } from './config.js';

// const apiKey = API_KEY;
// const mongoUrl = 'mongodb://localhost:27017'; // MongoDB connection URL
// const pagesPerRun = 3; // Number of pages to fetch per run
// const delayBetweenRuns = 60000; // Delay between runs in milliseconds (e.g., 1 minute)

// async function fetchModernLoveArticles(page = 0) {
//     const query = 'modern love';
//     const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${apiKey}&page=${page}`);
//     const data = await response.json();
//     return data.response.docs;
// }

// function extractLocations(articles) {
//     return articles.map(article => {
//         const keywords = article.keywords.filter(k => k.name === 'glocations');
//         return {
//             title: article.headline.main,
//             location: keywords.length > 0 ? keywords[0].value : null,
//             url: article.web_url
//         };
//     }).filter(article => article.location !== null);
// }

// async function storeArticlesInMongoDB(articles) {
//     const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

//     try {
//         await client.connect();
//         const database = client.db('modern_love_articles');
//         const collection = database.collection('articles');

//         // Insert articles into MongoDB
//         const result = await collection.insertMany(articles);
//         console.log(`${result.insertedCount} articles inserted into MongoDB.`);
//     } finally {
//         await client.close();
//     }
// }

// async function fetchAndStoreArticles(startPage) {
//     let page = startPage;
//     let moreArticlesAvailable = true;

//     while (moreArticlesAvailable) {
//         let allArticles = [];
//         let currentPage = page;

//         // Fetch multiple pages
//         for (let i = 0; i < pagesPerRun; i++) {
//             const articles = await fetchModernLoveArticles(currentPage);
//             if (articles.length > 0) {
//                 allArticles = allArticles.concat(articles);
//                 currentPage += 1;
//             } else {
//                 moreArticlesAvailable = false;
//                 break;
//             }
//         }

//         if (allArticles.length > 0) {
//             const locatedArticles = extractLocations(allArticles);
//             await storeArticlesInMongoDB(locatedArticles);
//         }

//         if (moreArticlesAvailable) {
//             console.log(`Waiting ${delayBetweenRuns / 1000} seconds before the next run...`);
//             await new Promise(resolve => setTimeout(resolve, delayBetweenRuns));
//         }

//         page = currentPage;
//     }
// }

// (async function main() {
//     const startPage = 0; // Start from page 0 or any specific page
//     await fetchAndStoreArticles(startPage);
// })();
