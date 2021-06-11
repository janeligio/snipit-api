import express from 'express'
const router = express.Router()
import Snippet from '../mongoose/models/Snippet'

function createSnippet (data, success, failure) {
    const snippet = new Snippet(data)

    snippet.save(err => {
        if (err) {
            failure(err)
        } else {
            success()
        }
    })
}

router.get('/', async (req, res) => {
    console.log(req.headers.host);
    try {
        const snippets = await Snippet.find({})
        res.status(200).send(snippets)
    } catch (err) {
        console.error(err)
        res.status(500).send('Error')
    }
})

router.post('/', (req, res) => {
    const { date, author, title, description, code, tags, likes } = req.body
    console.log(req.body)

    const data = { date, author, title, description, code, tags, likes }
    const successCallback = () => res.status(200).send('Created snippet')
    const failureCallback = (err) => res.status(500).json(err)
    createSnippet(data, successCallback, failureCallback)
})

export default router