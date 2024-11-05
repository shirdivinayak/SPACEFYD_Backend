const connect = require('./dbConnector');

async function executeMongoQuery(collection, operation, query) {
    let db;
    
    try {
        db = await connect.connectToDatabase(); // db instance from connectToDatabase
        const coll = db.collection(collection);

        switch (operation) {
            case 'find':
                return await coll.find(query).toArray();
            case 'insert':
                return await coll.insertMany(query);
            case 'update':
                return await coll.updateMany(query.filter, query.update);
            case 'delete':
                return await coll.deleteMany(query);
            default:
                throw new Error('Invalid operation');
        }
    } catch (error) {
        console.error('Error executing MongoDB query:', error);
        throw error;
    }
}

module.exports = {
    executeMongoQuery
};
