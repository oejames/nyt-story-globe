import express from 'express';
import path from 'path';
import { connectDB } from './db.js';

const router = express.Router();

router.get('/api/articles', async (req, res) => {
    try {
        const db = await connectDB(process.env.MONGODB_URI);
        const articles = await db.collection('articles').find({}).toArray();
        res.json(articles);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

router.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/index.html'));
});

export default router;