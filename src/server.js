import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

let client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
let database;

async function fetchArticlesFromMongoDB() {
    try {
        console.log('Connecting to MongoDB...');
        if (!client.isConnected()) await client.connect();
        console.log('Connected to MongoDB');
        database = client.db('modern_love_articles');
        const collection = database.collection('articles');
        const articles = await collection.find({}).toArray();
        return articles;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

app.get('/api/articles', async (req, res) => {
    try {
        const articles = await fetchArticlesFromMongoDB();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch articles.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
