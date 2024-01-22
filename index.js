const express = require('express');
const fileUpload = require('express-fileupload');
const { MongoClient, Binary } = require('mongodb');

const app = express();
const router = express.Router();
// If you are testing with a local MongoDB server, do not use localhost because it tries to use ipv6 for
// some reason (goodbye 1 hour of my time). Just use 127.0.0.1 which is the same but forces ipv4
const mongoUrl = `mongodb://127.0.0.1:27017`; 

// Serving static files
router.use(express.static('public'));

// Express middleware for incoming requests with enctype="multipart/form-data", lets you access files using req.files
app.use(fileUpload());

router.post('/upload', (req, res) => {
    // req.files.foo.data contains the file content. the name 'foo' comes from the <input>'s name attribute
    // Binary is a mongodb class for BSON that lets you store binary data (images, videos, etc.)
    let file = {
        name: req.body.name,
        file: new Binary(req.files.foo.data)
    };

    console.log('User uploaded file:', file.name);
    insertFile(file);

    // Redirect to homepage otherwise it will just hang
    res.redirect('/');
});

router.get('/download', async (req, res) => {
    const buffer = await getImage().catch((err) => {
        console.log('Error occured finding file:', err);
    });

    res.setHeader('Content-Type', 'image');
    res.send(buffer);
});

app.use('/', router);
app.listen(3000, () => console.log('Listening on port 3000'));


async function insertFile(file) {
    console.log('uploading');
    const client = new MongoClient(mongoUrl);
    await client.connect().catch((err) => {
        console.log('Error occured connecting to mongo:', err);
    });
    console.log('connected');

    const db = client.db('fileUploadDB');
    const collection = db.collection('files');

    await collection.insertOne(file);
    client.close();
}


async function getImage() {
    console.log('downloading');
    const client = new MongoClient(mongoUrl);
    await client.connect().catch((err) => {
        console.log('Error occured connecting to mongo:', err);
    });
    console.log('connected');

    const db = client.db('fileUploadDB');
    const collection = db.collection('files');

    return new Promise((resolve, reject) => {
        collection.find({}).toArray().then((docs) => {
            const buffer = docs[0].file.buffer;
            resolve(buffer);
        }).catch((err) => {
            reject(err);
        }).finally(() => {
            client.close();
        });
    });
}