import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI;
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

// Get the current directory from the ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the index.html file when visiting the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

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
