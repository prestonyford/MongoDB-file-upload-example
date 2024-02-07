const express = require('express');
const fileUpload = require('express-fileupload');
const { MongoClient, Binary } = require('mongodb');

const config = require('./dbConfig.js');

const app = express();
const router = express.Router();
// If you are testing with a local MongoDB server, do not use localhost because it tries to use ipv6 for
// some reason. Just use 127.0.0.1 which is the same but forces ipv4
// const mongoUrl = `mongodb://127.0.0.1:27017`; 
const mongoUrl = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;

// Serving static files
app.use(express.static('public'));

// Express middleware for incoming requests with enctype="multipart/form-data" (FormData), lets you access files using req.files
router.use(fileUpload());

router.post('/upload/:filename', async (req, res) => {
    // Binary is a mongodb class for BSON that lets you store binary data (images, videos, etc.)
    let file = {
        name: req.params.filename,
        file: new Binary(req.files.file.data)
    };

    insertFile(file).then((result) => {
        res.status(201).end();
    }).catch((err) => {
        console.log('Error inserting file:', err)
        res.status(500).send('An error occured');
    });
    console.log('User uploaded file:', file.name);
});

router.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;
    console.log('User requested file:', filename);

    getFile(filename).then(buffer => {
        res.setHeader('Content-Type', `image/${filename.split('.').pop()}`); // Sets image type to file extension
        res.status(200).send(buffer);
    }).catch((err) => {
        console.log('Error getting file:', err);
        res.status(404).send('File not found');
    });
});

app.use('/', router);
app.listen(3000, () => console.log('Listening on port 3000'));


function insertFile(file) {
    const client = new MongoClient(mongoUrl);
    
    return new Promise((resolve, reject) => {
        client.connect()
        .then(async () => {
            const db = client.db('fileUploadDB');
            const collection = db.collection('files');
            await collection.insertOne(file);
            resolve("Successfully inserted file: " + file.name);
        })
        .catch((err) => {
            reject(err);
        })
        .finally(() => {
            client.close();
        });
    });
}


function getFile(filename) {
    const client = new MongoClient(mongoUrl);

    return new Promise((resolve, reject) => {
        client.connect()
        .then(async () => {
            const db = client.db('fileUploadDB');
            const collection = db.collection('files');
            const doc = await collection.findOne({name: filename});
            if (!doc) {
                reject('File not found');
            }
            resolve(doc.file.buffer);
        })
        .catch((err) => {
            reject(err);
        })
        .finally(() => {
            client.close();
        });
    });
}