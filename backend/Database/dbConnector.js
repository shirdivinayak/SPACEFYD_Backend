const { MongoClient,ServerApiVersion } = require('mongodb');

// Replace with your MongoDB Atlas connection string
const uri = "mongodb+srv://connectspacifyd:WUkMZz89iycol5mb@cluster0.mtq5e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Update with your Atlas URI
const dbName = "Spacifyd"; // Replace with your database name

let client;
let db;

async function connectToDatabase() {
    if (!client ) {
        try {
            // Establish a new connection
            client = new MongoClient(uri, {
                serverApi: {
                  version: ServerApiVersion.v1,
                  strict: false,
                  deprecationErrors: true,
                }
              });

            // Connecting to MongoDB Atlas
            await client.connect();
            console.log("Connected to MongoDB Atlas");

            // Use the database
            db = client.db(dbName);
        } catch (error) {
            console.error("Error connecting to MongoDB", error);
            throw error;  // Re-throw the error after logging it
        }
    }

    // Return the database object for use in other parts of the app
    return db;
}

// Export the connection function
module.exports = { connectToDatabase };
