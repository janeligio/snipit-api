import express from 'express';
import _ from 'lodash';
import { authenticateUser, authorizeUser } from '../middleware/authenticator';
import User from '../mongoose/models/User';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet';

const userRoutes = express.Router();

/**
 * @route GET /api/v2/user/private?(id=userId)|(?username=username)
 * @description Access user information (private) - AUTHENTICATION & AUTHORIZATION REQUIRED
 * @access Private
 */
userRoutes.get('/private', authenticateUser, authorizeUser, async (req, res) => {
    const { id } = res.locals.auth;

    try {
        const USER_PRIVATE_FIELDS = '_id date username email name bio';
        const user = await User.findById(id, USER_PRIVATE_FIELDS).exec();

        if (!user) {
            res.status(404).json({ error: 'User does not exist.' });
            return;
        }

        const snippetGroups = await SnippetGroup.find({ userId: id }).exec();
        // const snippetGroupIds = _.map(snippetGroups, '_id');

        async function getSnippets(snippetGroupId) {
            const sgid = typeof snippetGroupId === 'string'
                ? snippetGroupId
                : snippetGroupId.toString();

            const snippets = await Snippet.find({ snippetGroupId: sgid });
            return snippets;
        }

        _.forEach(snippetGroups, async (snippetGroup) => {
            const snippetGroupId = snippetGroup._id.toString();
            const snippets = await getSnippets(snippetGroupId);
            snippetGroup.snippets = snippets;
        })

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
    const snippetFields = '_id date hidden updated title description snippets tags'

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

        const snippetGroups = await SnippetGroup.find({ userId: user._id.toString(), private: false }).exec();

        async function getSnippets(snippetGroupId) {
            const sgid = typeof snippetGroupId === 'string'
                ? snippetGroupId
                : snippetGroupId.toString();

            const snippets = await Snippet.find({ snippetGroupId: sgid });
            return snippets;
        }

        _.forEach(snippetGroups, async (snippetGroup) => {
            const snippetGroupId = snippetGroup._id.toString();
            const snippets = await getSnippets(snippetGroupId);
            snippetGroup.snippets = snippets;
        })

        res.status(200);
        res.json({ user, snippets: snippetGroups });
        return;
    } catch (err) {
        res.status(500).json({ error: err });
        return;
    }
})

export default userRoutes;