import express from 'express'
import _ from 'lodash';
import { authenticateUser, authorizeUser } from '../middleware/authenticator'
import { validateSnippet, validateSnippetGroup } from '../util/validation';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet'

const snippetRoutes = express.Router()


function createSnippetGroup(data, success, failure) {
    const { isPrivate, title, snippets, userId } = data;
    const snippetIds = [];
    const succes = (id) => { snippetIds.push(id) };

    _.forEach(snippets, (snip) => {
        createSnippet(snip, succes, failure);
    });

    const snippetGroup = new SnippetGroup({ isPrivate, title, snippetIds, userId });

    snippetGroup.save(err => {
        if (err) {
            failure(err)
        } else {
            success()
        }
    })
}

function createSnippet(data, success, failure) {
    const snippet = new Snippet(data)

    snippet.save(err => {
        if (err) {
            failure(err)
        } else {
            success(snippet._id);
        }
    })
}

// Get all public snippets
/**
 * @route GET /snippets/all
 * @description Get all public snippets
 * @access Public
 **/
snippetRoutes.get('/all', async (req, res) => { 
    console.log(req.headers.host);
    try {
        const snippets = await SnippetGroup.find({private: false});
        res.status(200).send(snippets);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error');
    }
})

// Get specific snippet
// Check if private field is true/false
//  If user is owner of snippet, return snippet
//  else return FORBIDDEN status code
/**
 * @route GET /snippets/:snippetGroupId
 * @description Get a snippet group.
 * @access Public
 */
snippetRoutes.get('/:snippetGroupId', authenticateUser, async (req, res) => { 
    const { snippetGroupId } = req.params;
    const { auth } = res.locals;

    if (snippetGroupId) {
        try {
            const snippetGroup: any = await SnippetGroup.findById(snippetGroupId).exec();

            if (snippetGroup.userId === auth.id) {
                res.json(snippetGroup);
            } else if (snippetGroup.private === false) {
                res.json(snippetGroup);
            } else {
                // If requester is not the owner of the snippet and snippet is private they are forbidden
                res.status(403).json({ error: 'FORBIDDEN' });
            }
        } catch (err) {
            res.json({error: 'Could not find snippet'});
        }
    } else {
        res.json({error: 'Must specify snippet group id'});
    }
})

// Get someone's snippets
// 
// snippetRoutes.get('/:userId', (req, res) => { })

// Post a snippet - AUTHENTICATION REQUIRED
/**
 * @route POST /snippets/create
 * @description Post a snippet
 * @access Private
 */
snippetRoutes.post('/create', authenticateUser, async (req, res) => { 
    const { isPrivate, title, snippets, userId } = req.body;
    console.log(req.body);
    const { isValid, errors } = await validateSnippetGroup({ isPrivate, title, snippets, userId });

    if (!isValid) {
        res.status(500).json({ error: errors });
    } else {
        const data = { isPrivate, title, snippets, userId };
        const successCallback = () => res.status(200).send('Created snippet');
        const failureCallback = (err) => res.status(500).json(err);
        createSnippetGroup(data, successCallback, failureCallback);
    }
})

// Delete a snippet - AUTHENTICATION & AUTHORIZATION REQUIRED
// First check if user is owner of snippet
/**
 * @route DELETE /snippets/delete/:snippetId
 * @description Delete a snippet from the database
 * @access Private
 */
snippetRoutes.delete('/delete/:snippetGroupId', authenticateUser, async (req, res) => {
    const { snippetGroupId } = req.params;
    const { auth } = res.locals;

    if (snippetGroupId && auth) {
        try {
            const snippetGroup: any = await SnippetGroup.findById(snippetGroupId).exec();
            if (snippetGroup.userId === auth.id) {
                // delete snippet
                try {
                    const snippets = snippetGroup.snippets;
                    _.forEach(snippets, async (snip) => {
                        await Snippet.deleteOne({_id: snip._id});
                    })
                    await SnippetGroup.deleteOne({_id: snippetGroupId});
                    res.json({ message: `Successfully deleted snippet ${snippetGroupId}` });
                } catch (err) {
                    res.json({ error : err });
                }
            } else {
                // If requester is not the owner of snippet group they are forbidden
                res.status(403).json({ error: 'FORBIDDEN' })
            }
        } catch (err) {
            res.json({ error: 'Snippet group does not exist' });
        }
    }
 })

// Edit a snippet - AUTHENTICATION & AUTHORIZATION REQUIRED
// First check if user is owner of snippet
snippetRoutes.put('/edit', authenticateUser, async (req, res) => { })

export default snippetRoutes;