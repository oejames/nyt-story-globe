import { MongoClient } from 'mongodb';

const mongoUrl = process.env.MONGODB_URI;
const client = new MongoClient(mongoUrl, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

let database;

export async function connectToDatabase() {
    if (!database) {
        await client.connect();
        database = client.db('modern_love_articles');
    }
    return database;
}