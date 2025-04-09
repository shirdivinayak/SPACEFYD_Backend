const connect = require('./dbConnector');
const { ObjectId } = require('mongodb');

async function executeMongoQuery(collection, operation, query = {}, options = {}) {
    let db;

    try {
        db = await connect.connectToDatabase();

        if (!db) throw new Error('Failed to connect to database');
        if (!collection) throw new Error('Collection name is required');

        const coll = db.collection(collection);
        if (!coll) throw new Error(`Collection ${collection} not found`);

        switch (operation) {
            case 'find': {
                const { skip = 0, limit, sort = { _id: -1 } } = options;
                
                let findQuery = coll.find(query).sort(sort).skip(skip);
                
                // Apply limit only if it's explicitly provided
                if (limit !== undefined && limit !== null) {
                    findQuery = findQuery.limit(limit);
                }
                
                return await findQuery.toArray();
            }
            case 'findOne':
                return await coll.findOne(query);
            case 'insert':
                return await coll.insertMany(query);
            case 'update':
                return await coll.updateMany(query.filter, query.update.$set ? query.update : { $set: query.update });

            case 'delete':
                if (query.filter._id) {
                    if (Array.isArray(query.filter._id)) {
                        const validIds = query.filter._id
                            .filter(id => ObjectId.isValid(id))  // Ensure only valid ObjectIds
                            .map(id => new ObjectId(id));

                        if (validIds.length === 0) {
                            throw new Error('No valid ObjectIds provided for deletion');
                        }

                        query.filter._id = { $in: validIds };  // Correct way to filter multiple IDs
                    } else {
                        if (!ObjectId.isValid(query.filter._id)) {
                            throw new Error('Invalid ObjectId provided');
                        }
                        query.filter._id = new ObjectId(query.filter._id);
                    }
                }
                return await coll.deleteMany(query.filter);

            case 'countDocuments':
                return await coll.countDocuments(query);

            case 'distinct': {
                if (!query.field) {
                    throw new Error('Field name is required for distinct operation');
                }
                return await coll.distinct(query.field, query.filter || {});
            }

            default:
                throw new Error('Invalid operation');
        }
    } catch (error) {
        console.error(`MongoDB Query Error [${operation}]:`, error);
        throw error;
    }
}

module.exports = {
    executeMongoQuery
};
