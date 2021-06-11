import express from 'express';
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator';
import User from '../mongoose/models/User';

const router = express.Router();

const publicFields = 'name info publicSnippets';
const privateFields = 'email name info publicSnippets privateSnippets';

/**
 * @route POST /user/:userId
 * @description Access user's information and snippets
 * @access Private
 */
router.get('/', authenticateUser, async (req, res) => {
    const { id } = req.query;

    if (id) {
        // Private access - Viewing your own profile
        if (validateUserAuthenticity(res.locals, req.body.id)) {
            try {
                const user = await User.findById(id, privateFields).exec();
                res.json(user);
            } catch (err) {

            }

        } else {
            // Public access - Viewing someone else's
            try {
                const user = await User.findById(id, publicFields).exec();
                res.status(200).json(user);

            } catch (err) {
                res.status(404).json({error: 'User does not exist.'});
            }
        }
    }
    res.json({error: 'Must specify userid'});
})

/**
 * @route POST /user/:username
 * @description Access another user's page, information and snippets
 * @access Public
 */
router.get('/:username', async (req, res) => {
    const { username } = req.params;
        try {
            const user = await User.findOne({username}, publicFields).exec();
            res.json(user);
        } catch (err) {
            res.json({error: 'User does not exist.'})
        }
    if (username) {

    } else {
        res.json({error: 'Must specify username'});
    }
})

router.post('/', async (req, res) => {

})

export default router;