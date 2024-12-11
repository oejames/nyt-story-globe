import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI;

// Get the current directory from the ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(cors());

// MongoDB Client Setup
let client;
let database;


// Function to fetch articles from MongoDB
async function fetchArticlesFromMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const database = client.db('modern_love_articles');
        const collection = database.collection('articles');
        const articles = await collection.find({}).toArray(); // Fetch all articles
        return articles;
    } catch (error) {
        console.error('Error fetching articles:', error.message);
        throw error; // Re-throw for further handling
    } finally {
        await client.close();
    }
}

// API endpoint to fetch articles
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await fetchArticlesFromMongoDB();
        res.json(articles); // Send articles as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch articles.' });
    }
});

// Serve the index.html file when visiting the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
