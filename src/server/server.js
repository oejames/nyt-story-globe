import express from 'express';
import cors from 'cors';
import routes from './server/routes.js';
import { closeDB } from './db.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('client'));

// Routes
app.use('/', routes);

// Handle shutdown
process.on('SIGTERM', async () => {
    await closeDB();
    process.exit(0);
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});