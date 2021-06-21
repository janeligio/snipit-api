import express from 'express';
import { authenticateUser, authorizeUser } from '../middleware/authenticator';
import User from '../mongoose/models/User';
import SnippetGroup from '../mongoose/models/SnippetGroup';

const userRoutes = express.Router();

// Access user information (private) - AUTHENTICATION & AUTHORIZATION REQUIRED
userRoutes.get('/private', authenticateUser, authorizeUser, async (req, res) => {
    const { id } = req.query;
    const privateFields = 'date username email name bio';
    try {
        const user = await User.findById(id, privateFields).exec();

        if (!user) {
            res.status(404).json({ error: 'User does not exist.' });
            return;
        }

        const snippetGroups = await SnippetGroup.find({ userId: id }).exec();
        res.status(200);
        res.json({ user, snippets: snippetGroups });
        return;
    } catch (err) {
        res.status(500).json({ error: err });
        return;
    }
})

// Access user information (public)
// Can search for a user by username or userId via queries
userRoutes.get('/public/', async (req, res) => {
    const { username, userId } = req.query;

    const publicFields = '_id date username name bio';
    const snippetFields = '_id date private updated title, snippets'

    let searchBy;
    if (username && typeof username === 'string' && username.length > 0) searchBy = { username }
    else if (userId && typeof userId === 'string' && userId.length > 0) searchBy = { _id: userId }
    else {
        res.status(400).json({ errors: 'Must specify username or userId' });
        return;
    }

    try {
        const user = await User.findOne(searchBy, publicFields).exec();

        if (!user) {
            res.status(404).json({ error: 'User does not exist.' });
            return;
        }

        const snippetGroups = await User.find({ userId: user._id }, snippetFields).exec();
        res.status(200);
        res.json({ user, snippets: snippetGroups });
        return;
    } catch (err) {
        res.status(500).json({ error: err });
        return;
    }
})

export default userRoutes;