/* eslint-disable semi */
import express from 'express';
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator';
import { validateBio } from '../util/validation';
import User from '../mongoose/models/User';
import Snippet from '../mongoose/models/Snippet';

const router = express.Router();

const publicFields = 'name info publicSnippets';
const privateFields = 'email name info publicSnippets privateSnippets';

function edit(user, success, failure) {
    user.save(err => {
        if (err) {
            failure(err)
        } else {
            success()
        }
    })
}

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

/**
 * @route PUT /user/edit/
 * @description Edit user's name and bio
 * @access Private
 */
 router.put('/edit/', authenticateUser, async (req, res) => {
    const { id } = req.query;
    const { name, bio } = req.body;
    // check name and bio
    const { isValid, errors } = await validateBio(name, bio);
    console.log("here", validateBio(name, bio));
    if (id) {
        if (isValid) {
            // Private access - Editing your own profile
            console.log(validateUserAuthenticity(res.locals, id))
            if (validateUserAuthenticity(res.locals, id)) {
                console.log("You are who you are")
                try {
                    const user: any = await User.findById(id, privateFields).exec();
                    user.info.name = name;
                    user.info.bio = bio;
                    console.log('user info:', user);
                    const successCallback = () => res.status(200).send(`Updated user account information: ${user}`);
                    const failureCallback = (err) => res.status(500).json(err);
                    edit(user, successCallback, failureCallback);
                } catch (err) {
                    res.status(404).json({ error: 'User does not exist.' });
                }
            }
        } else {
            res.json({ error: errors });
        }
    } else {
        res.json({ error: 'Must specify userid' });
    }
})

router.post('/', async (req, res) => {

})

export default router;