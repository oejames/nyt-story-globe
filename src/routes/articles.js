import express from 'express';
import { connectToDatabase } from '../config/database.js';

const router = express.Router();

router.get('/api/articles', async (req, res) => {
    try {
        const database = await connectToDatabase();
        const collection = database.collection('articles');
        const articles = await collection.find({}).toArray();
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles.' });
    }
});

export default router;