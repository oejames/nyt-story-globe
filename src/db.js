import { MongoClient } from 'mongodb';

let client = null;
let database = null;

export async function connectDB(mongoUrl) {
    if (!client) {
        client = new MongoClient(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await client.connect();
        database = client.db('modern_love_articles');
        console.log('Connected to MongoDB');
    }
    return database;
}

export async function closeDB() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
}