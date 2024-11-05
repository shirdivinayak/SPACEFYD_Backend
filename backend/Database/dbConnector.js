// dbConnection.js
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const dbName = "MasterTable"; // Replace with your database name

let client;
let db;

async function connectToDatabase() {
    if (!client || !client.topology || !client.topology.isConnected()) {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName);
    }
    return db;
}

module.exports = { connectToDatabase };
