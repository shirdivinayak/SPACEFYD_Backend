const restify = require('restify');
const router = require('./Router/router');
const corsMiddleware = require('restify-cors-middleware');

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


// Apply routes
router.applyRoutes(server);

// Start the server
server.listen(8080, () => {
    console.log(`Server running on port 5000`);
});
