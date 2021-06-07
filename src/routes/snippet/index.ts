import express from 'express';
const router = express.Router();
import Snippet from '../../mongoDB/models/Snippet';

function createSnippet (data, success, failure) {
    const snippet = new Snippet(data);

    snippet.save(err => {
        if (err) {
            success();
        } else {
            failure();
        }
    })
}

router.get('/', async (req, res) => {
    try {
        const snippets = await Snippet.find({});
        res.status(200).send(snippets);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
})

router.post('/snip', (req, res) => {
    const { date, author, title, description, code, tags, likes } = req.body;

    const data = { date, author, title, description, code, tags, likes };
    const successCallback = () => res.status(200).send("Created snippet");
    const failureCallback = (err) => res.status(500).json(err);
    createSnippet(data, successCallback, failureCallback);
})