const restify = require('restify');
const router = require('./Router/router');
const corsMiddleware = require('restify-cors-middleware');
const { connectToDatabase } = require('./Database/dbConnector'); // Update with correct path

// Create a Restify server
const server = restify.createServer();

// Use Restify body parser plugin
server.use(restify.plugins.bodyParser());

// Configure CORS
const cors = corsMiddleware({
    origins: ['*'], // Allow all origins, or specify allowed origins as ['http://example.com']
    allowHeaders: ['Authorization', 'Content-Type'], // Add other headers if needed
    exposeHeaders: ['Authorization'] // Add headers you want to expose to the client
});

// Apply CORS middleware
server.pre(cors.preflight);
server.use(cors.actual);

// Initialize the application
async function initializeApp() {
    try {
        // Connect to the database
        await connectToDatabase();
        console.log('Database connection established');
        
        // Apply routes
        router.applyRoutes(server);

        // Start the server
        server.listen(8000, () => {
            console.log(`Server running on port 8000`);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1); // Exit with error code
    }
}

// Start the application
initializeApp();