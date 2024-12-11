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

async function connectToMongoDB() {
    try {
        if (!client) {
            client = new MongoClient(mongoUrl);
            await client.connect();
            database = client.db('modern_love_articles'); // Replace with your database name
            console.log('Connected to MongoDB');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
}

// Endpoint to fetch articles
app.get('/api/articles', async (req, res) => {
    try {
        await connectToMongoDB();
        const collection = database.collection('articles'); // Replace with your collection name
        const articles = await collection.find({}).toArray();
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error.message);
        res.status(500).json({ error: error.message });
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
