import express from 'express'
import _ from 'lodash';
import { authenticateUser, authorizeUser, validateUserAuthenticity } from '../middleware/authenticator'
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

function editSnippetGroup(snippetGroup, success, failure) {
    _.forEach(snippetGroup.snippets, async snip => {
        const snippet: any = await Snippet.findById(snip._id);
        editSnippet(snippet, snip, failure);
    });

    snippetGroup.save(err => {
        if (err) {
            failure(err);
        } else {
            success();
        }
    })
}

function editSnippet(snippet, data, failure) {
    snippet.title = data.title;
    snippet.description = data.description;
    snippet.code = data.code;
    snippet.updated = Date.now();
    snippet.fileName = data.fileName;
    snippet.language = data.language;
    snippet.order = data.order;

    snippet.save(err => {
        if (err) {
            failure(err)
        }
    })
}

// Get all public snippets
/**
 * @route GET /api/v2/snippets/all
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
 * @route GET /api/v2/snippets/:snippetGroupId
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
 * @route POST /api/v2/snippets/create
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
// TODO: make a delete for a single snippet
/**
 * @route DELETE /api/v2/snippets/delete/:snippetId
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
/**
 * @route PUT /api/v2/snippets/edit/:snippetGroupId
 * @description Edit a snippet group
 * @access Private
 */
 snippetRoutes.put('/edit/:snippetGroupId', authenticateUser, async (req, res) => {
    const { isPrivate, title, snippets, userId } = req.body;
    const { snippetGroupId } = req.params;

    const { isValid, errors } = await validateSnippetGroup({ isPrivate, title, snippets, userId });

    console.log(validateSnippet({ isPrivate, title, snippets, userId }));

    if (snippetGroupId) {
        if (isValid) {
            // Private access - Editing your own snippet
            console.log(validateUserAuthenticity(res.locals, userId));

            if (validateUserAuthenticity(res.locals, userId)) {
                console.log("You are who you are")
                try {
                    const snippetGroup: any = await SnippetGroup.findById(snippetGroupId).exec();
                    snippetGroup.isPrivate = isPrivate;
                    snippetGroup.title = title;
                    snippetGroup.updated = Date.now();
                    console.log('snippetGroup:', snippetGroup);
                    const successCallback = () => res.status(200).send('Updated snippet information');
                    const failureCallback = (err) => res.status(500).json(err);
                    editSnippetGroup(snippetGroup, successCallback, failureCallback);
                } catch (err) {
                    res.status(404).json({ error: 'Snippet group does not exist.' });
                }
            }
        } else {
            res.json({ error: errors });
        }
    } else {
        res.json({ error: 'Must specify snippetGroupId' });
    }
})


export default snippetRoutes;