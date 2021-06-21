import express from 'express';
import _ from 'lodash';
import { authenticateUser, authorizeUser } from '../middleware/authenticator';
import User from '../mongoose/models/User';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet';

const userRoutes = express.Router();

// Access user information (private) - AUTHENTICATION & AUTHORIZATION REQUIRED
userRoutes.get('/private', authenticateUser, authorizeUser, async (req, res) => {
    const { id, username } = req.query;

    const privateFields = 'date username email name bio';

    let searchBy;
    if (username) searchBy = { username }
    else searchBy = { _id: id }

    try {
        const user = await User.findOne(searchBy, privateFields).exec();

        if (!user) {
            res.status(404).json({ error: 'User does not exist.' });
            return;
        }

        const snippetGroups = await SnippetGroup.find({ userId: id }).exec();

        const mappedSnippetGroups = attachSnippets(snippetGroups);

        res.status(200);
        res.json({ user, snippets: mappedSnippetGroups });
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

        const snippetGroups = await User.find({ userId: user._id, private: false }, snippetFields).exec();

        // Attach snippets to each snippet group
        const mappedSnippetGroups = attachSnippets(snippetGroups);

        res.status(200);
        res.json({ user, snippets: mappedSnippetGroups });
        return;
    } catch (err) {
        res.status(500).json({ error: err });
        return;
    }
})


// Attach snippets to each snippet group
function attachSnippets(snippetGroups) {

    const mappedSnippetGroups = _.map(snippetGroups, (snippetGroup) => {

        const snippetIds = snippetGroup.snippets;
        const snippets = [];

        _.forEach(snippetIds, async (id) => {
            const snippet = await Snippet.findById(id).exec();
            if (snippet) snippets.push(snippet);
        })

        snippetGroup.snippets = snippets;

        return snippetGroup;
    });
    return mappedSnippetGroups;
}
export default userRoutes;