import express from 'express';
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator';
import User from '../mongoose/models/User';
import Snippet from '../mongoose/models/Snippet';

const router = express.Router();

const publicFields = 'name info publicSnippets';
const privateFields = 'email name info publicSnippets privateSnippets';

/**
 * @route GET /user/?id=some-user's-id
 * @description Access user's information and snippets
 * @access Private
 */
router.get('/', authenticateUser, async (req, res) => {
    const { id } = req.query;
    if (id) {
        // Private access - Viewing your own profile
        console.log(validateUserAuthenticity(res.locals, id))
        if (validateUserAuthenticity(res.locals, id)) {
            console.log("You are who you are")
            try {
                const user = await User.findById(id, privateFields).exec();
                console.log('sending data:', user);
                res.json(user);
            } catch (err) {
                res.status(404).json({ error: 'User does not exist.' });
            }
        } else {
            // Public access - Viewing someone else's
            try {
                const user = await User.findById(id, publicFields).exec();
                res.status(200).json(user);
            } catch (err) {
                res.status(404).json({ error: 'User does not exist.' });
            }
        }
    } else {
        res.json({ error: 'Must specify userid' });
    }
})

/**
 * @route GET /user/public/:username
 * @description Access another user's page, information and snippets
 * @access Public
 */
router.get('/public/:username', async (req, res) => {
    const { username } = req.params;
    console.log('hit')
    if (username) {

    } else {
        res.json({ error: 'Must specify username' });
    }
    try {
        const user = await User.findOne({ _id: username }, publicFields).exec();
        const snippets = await Snippet.find({ owner: username }).exec();
        res.json({ user, snippets });
    } catch (err) {
        res.json({ error: 'User does not exist.' })
    }
})

router.post('/', async (req, res) => {

})

export default router;