import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUrl);

app.use(cors());

async function fetchArticlesFromMongoDB() {
    await client.connect();
    const database = client.db('modern_love_articles');
    const collection = database.collection('articles');
    const articles = await collection.find({}).toArray();
    await client.close();
    return articles;
}

app.get('/api/articles', async (req, res) => {
    try {
        const articles = await fetchArticlesFromMongoDB();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
