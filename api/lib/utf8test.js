const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/";
const dbName = "nodejs_starter_project";

function isValidUTF8(str) {
    try {
        decodeURIComponent(escape(str));
        return true;
    } catch (e) {
        return false;
    }
}

async function checkUTF8InCollection(collection) {
    const cursor = collection.find({});
    const invalidDocs = [];

    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        for (const key in doc) {
            if (typeof doc[key] === 'string' && !isValidUTF8(doc[key])) {
                invalidDocs.push({ doc, key, value: doc[key] });
            }
        }
    }

    return invalidDocs;
}

async function run() {
    const client = new MongoClient(url);

    try {
        // MongoDB sunucusuna bağlanın
        await client.connect();
        console.log("Connected to the database!");

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        const invalidUTF8Docs = [];

        for (const collectionInfo of collections) {
            const collection = db.collection(collectionInfo.name);
            console.log(`Checking collection: ${collectionInfo.name}`);
            const invalidDocs = await checkUTF8InCollection(collection);
            if (invalidDocs.length > 0) {
                invalidUTF8Docs.push({ collection: collectionInfo.name, invalidDocs });
            }
        }

        console.log("Invalid UTF-8 Documents:", JSON.stringify(invalidUTF8Docs, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        // Bağlantıyı kapatın
        await client.close();
    }
}

run().catch(console.dir);
