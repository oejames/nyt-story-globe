import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { closeDB } from './db.js';

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.static('client'));


app.use('/', routes);

// handle shutdown
process.on('SIGTERM', async () => {
    await closeDB();
    process.exit(0);
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});