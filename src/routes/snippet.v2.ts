import express from 'express'
import _ from 'lodash';
import { authenticateUser, authorizeUser, validateUserAuthenticity } from '../middleware/authenticator'
import { validateSnippet, validateSnippetGroup } from '../util/validation';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet';
import User from '../mongoose/models/User';

const snippetRoutes = express.Router()


async function createSnippetGroup(data, success, failure) {
    const { isPrivate, title, snippets, userId } = data;
    const snippetIds = [];
    const succes = (id) => { snippetIds.push(id) };

    try {
        const snippetDocuments = await Snippet.create(snippets);
        _.forEach(snippetDocuments, snippet => snippetIds.push(snippet.id));
    } catch (err) {
        failure(err)
    }
    console.log(snippetIds);
    // _.forEach(snippets, async (snip) => {
    //     const snippet = await Snippet.create(snip);
    //     console.log(snippet);
    //     snippetIds.push(snippet._id);
    // });

    const snippetGroup = new SnippetGroup({ isPrivate, title, snippets: snippetIds, userId });

    snippetGroup.save(err => {
        if (err) {
            failure(err)
        } else {
            success()
        }
    })
}

async function createSnippet(data, success, failure) {
    //const snippet = new Snippet(data);
    const snippet = await Snippet.create(data);
    const id = snippet._id;
    success(id);
    console.log(id);

    /*
        snippet.save(err => {
            if (err) {
                console.log('fail');
                failure(err)
            } else {
                console.log('success');
                success(id);
            }
        })
    */
    console.log('fin');
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
        const snippets = await SnippetGroup.find({ hidden: false });
        res.status(200).send(snippets);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error');
    }
})


/**
 * @route GET /api/v2/snippets/snippet/all
 * @description Get all public snippets
 * @access Public
 **/
 snippetRoutes.get('/snippet/all', async (req, res) => {
    console.log(req.headers.host);
    try {
        const snippets = await Snippet.find();
        res.status(200).send(snippets);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error');
    }
})

/**
 * @route GET /api/v2/snippets/user/:username
 * @description Get a users snippets.
 * @access Public
 */
snippetRoutes.get('/user/:username', authenticateUser, async (req, res) => {
    const { username } = req.params;
    const { auth } = res.locals;

    const user: any = await User.find({username}).exec();

    if (username) {
        if (user) {
            if (username == auth.username) {
                try {
                    const snippetGroups: any = await SnippetGroup.find({userId: auth.id}).exec();
                    /*try {
                        _.forEach(snippetGroups, async (group) => {
                            group.snips = await Snippet.find({snippetGroupId: group._id}).exec();
                            //console.log(group.snips);
                        });
                        console.log(snippetGroups);
                    } catch {
                        console.log('oppsie');
                    }*/
                    
                    /*const ret = _.map(snippetGroups, async (group) => {
                        const groupSnips = group;
                        group.snips = await Snippet.find({snippetGroupId: group._id}).exec();
                        return groupSnips;
                    });*/

                    console.log(snippetGroups);
                    res.json(snippetGroups);
                } catch (err) {
                    res.json({ error: 'Could not find snippet group' });
                }
            } else {    // not your account
                try {
                    const snippetGroups: any = await SnippetGroup.find({userId: user._id, hidden: false}).exec();
                    res.json(snippetGroups);
                } catch (err) {
                    res.json({ error: 'Could not find snippets' })
                }
            }
        } else {
            res.json({ error: 'User does not exist' });
        }
    } else {
        res.json({ error: 'Must specify a username' });
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
            const snippets = await Snippet.find({snippetGroupId: snippetGroupId}).exec();
            console.log(snippets);
            
            if (snippetGroup.userId == auth.id) {
                res.json({snippetGroup, snippets});
            } else if (snippetGroup.hidden === false) {
                res.json({snippetGroup, snippets});
            } else {
                // If requester is not the owner of the snippet and snippet is private they are forbidden
                res.status(403).json({ error: 'FORBIDDEN' });
            }
        } catch (err) {
            res.json({ error: 'Could not find snippet' });
        }
    } else {
        res.json({ error: 'Must specify snippet group id' });
    }
})

// either have this or do something like on line 125
/**
 * @route GET /api/v2/snippets/snippet/:snippetId
 * @description Get a single snippet.
 * @access Public
 */
snippetRoutes.get('/snippet/:snippetId', authenticateUser, async (req, res) => {
    const { snippetId } = req.params;
    const { auth } = res.locals;

    if (snippetId) {
        try {
            const snippet: any = await Snippet.findById(snippetId).exec();

            if (snippet.userId == auth.id) {
                res.json(snippet);
            } else if (snippet.private === false) {
                res.json(snippet);
            } else {
                // If requester is not the owner of the snippet and snippet is private they are forbidden
                res.status(403).json({ error: 'FORBIDDEN' });
            }
        } catch (err) {
            res.json({ error: 'Could not find snippet' });
        }
    } else {
        res.json({ error: 'Must specify snippet id' });
    }
})


// Post a snippet - AUTHENTICATION REQUIRED
/**
 * @route POST /api/v2/snippets/create
 * @description Post a snippet
 * @access Private
 */
snippetRoutes.post('/create', authenticateUser, async (req, res) => {
    const { hidden, title, description, tags, snippets } = req.body;
    const userId = res.locals.auth.id;
    
    if (!userId) {
        res.status(400).json({ errors: 'Invalid user id' });
    }

    const { isValid, errors } = validateSnippetGroup({ hidden, title, description, tags, snippets });

    if (!isValid) {
        res.status(500).json({ error: errors });
        return;
    }

    // Make sure each snippet is valid
    // _.forEach(snippets, snippet => {
    //     const { isValid, errors } = validateSnippet(snippet);
    //     if (!isValid) {
    //         res.json({ errors });
    //         return;
    //     }
    // })

    // Insert snippetGroup into db
    let snippetGroup;

    try {
        snippetGroup = await SnippetGroup.create({ hidden, title, description, userId, tags });
    } catch (err) {
        res.status(500).json({ errors: err });
        return;
    }

    const snippetGroupId = snippetGroup._id.toString();

    // Insert each snippet into db
    const snippetsToInsert = _.map(snippets, (snippet) => {
        snippet.userId = userId;
        snippet.snippetGroupId = snippetGroupId;
        return snippet;
    });

    try {
        await Snippet.create(snippetsToInsert);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ errors: err });
        return;
    }

    res.json({ success: true });
})


/**
 * @route DELETE /api/v2/snippets/delete/?=username || userId
 * @description Delete a snippet group and its snippets from the database
 * @access Private
 */
snippetRoutes.delete('/delete/', authenticateUser, authorizeUser, async (req, res) => {
    const { snippetGroupId } = req.body;
    const { auth } = res.locals;

    if (snippetGroupId && auth) {
        try {
            const snippetGroup: any = await SnippetGroup.findById(snippetGroupId).exec();
            if (snippetGroup.userId == auth.id) {
                // delete snippet
                try {
                    const snippets = await Snippet.find({snippetGroupId: snippetGroupId}).exec();
                    _.forEach(snippets, async (snip) => {
                        await Snippet.deleteOne({ _id: snip._id });
                    })
                    await SnippetGroup.deleteOne({ _id: snippetGroupId });
                    res.json({ message: `Successfully deleted snippet ${snippetGroupId}` });
                } catch (err) {
                    res.json({ error: err });
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


/**
 * @route DELETE /api/v2/snippets/snippet/delete/?=username || userId
 * @description Delete an individual snippet from the database
 * @access Private
 */
 snippetRoutes.delete('/snippet/delete/', authenticateUser, authorizeUser, async (req, res) => {
    const { snippetId, groupId } = req.body;
    const { auth } = res.locals;
    console.log(auth);
    console.log(snippetId);

    if (snippetId && auth) {
        try {
            const snippet: any = await Snippet.findById(snippetId).exec();
            if (snippet.snippetGroupId == groupId) {
                if (snippet.userId == auth.id) {
                    // delete snippet
                    try {
                        await Snippet.deleteOne({ _id: snippetId });
                        res.json({ message: `Successfully deleted snippet ${snippetId}` });
                    } catch (err) {
                        res.json({ error: err });
                    }
                } else {
                    // If requester is not the owner of snippet group they are forbidden
                    res.status(403).json({ error: 'FORBIDDEN' });
                }
            } else {
                res.json({ error: "Snippets groups id does not match group Id" });
            }
        } catch (err) {
            res.json({ error: 'Snippet does not exist' });
        }
    }
})


/**
 * @route PUT /api/v2/snippets/edit/private/?(id=userId)|(?username=username)
 * @description Mark a snippet group hidden or not
 * @access Private
 */
 snippetRoutes.put('/edit/private/', authenticateUser, authorizeUser, async (req, res) => {
    const { hidden, snippetGroupId } = req.body;
    const { username } = res.locals.auth;
    console.log(res.locals.auth);

    if (snippetGroupId) {
        if (typeof hidden === 'boolean') {
            if (username) {
                console.log("You are who you are")
                try {
                    const snippetGroup: any = await SnippetGroup.findById(snippetGroupId).exec();
                    snippetGroup.hidden = hidden;
                    snippetGroup.updated = Date.now();
                    console.log('snippetGroup:', snippetGroup);
                    snippetGroup.save();
                    res.status(200).json("Snippet group updated");
                } catch (err) {
                    res.status(404).json({ error: 'Snippet group does not exist.' });
                }
            } else {
                res.json({ error: "Must provide userId" });
            }
        } else {
            res.json({ error: "Must provide boolean" });
        }
    } else {
        res.json({ error: 'Must specify snippetGroupId' });
    }
})


/**
 * @route PUT /api/v2/snippets/edit/?username | ?id
 * @description Edit a snippet group and its snippets
 * @access Private
 */

/*
{"group": {"id": "60f8b4d0dcccfd307ce7a8f6", "userId": "60d7ec506efb2d1f5862de3d", "hidden": false, 
"title": "21 testing the edit", "description": "desc edit", "tags": []}, 
"snippets": [{"id": "60f8b4d0dcccfd307ce7a8f7", "fileName": "filename", 
"title": "21 1st snip test edit", "description": "snip edit desc", 
"code": "console.log(hinew)", "language": "javascript", "order": 1}, 
{"id": "60f8b4d0dcccfd307ce7a8f8", "fileName": "filename", "title": "21 2nd snip edit", 
"description": "snip edit desc", "code": "console.log(hinew)", "language": "javascript", "order": 2}]}
*/

snippetRoutes.put('/edit/snippet', authenticateUser, authorizeUser, async (req, res) => {
    const { group, snippets } = req.body;
    const snippetGroupId = group.id;
    const { id } = res.locals.auth;

    const { isValid, errors } = await validateSnippetGroup(group);
    console.log('here1');
    // validate snippets

    if (snippetGroupId) {
        console.log('here2');
        if (isValid) {
            console.log('here3');
            if (id === group.userId) {
                console.log('here4');
                try {
                    const snippetGroup: any = await SnippetGroup.findById(snippetGroupId).exec();
                    snippetGroup.title = group.title;
                    snippetGroup.description = group.description;
                    snippetGroup.tags = group.tags;
                    snippetGroup.updated = Date.now();
                    //console.log('snippetGroup:', snippetGroup);
                    let updatedSnippets = [];
                    console.log('here5');

                    for (let i = 0; i < snippets.length; i++) {
                        const nSnippet: any = await Snippet.findById(snippets[i].id).exec();
                        nSnippet.fileName = snippets[i].fileName;
                        nSnippet.title = snippets[i].title;
                        nSnippet.description = snippets[i].description;
                        nSnippet.language = snippets[i].language;
                        nSnippet.code = snippets[i].code;
                        nSnippet.order = snippets[i].order;
                        nSnippet.updated = Date.now();
                        updatedSnippets.push(nSnippet);
                    }
                    console.log('here6');
                    
                    await snippetGroup.save();
                    console.log('here7');
                    for (let i = 0; i < updatedSnippets.length; i++) {
                        await updatedSnippets[i].save();
                    }
                    
                    console.log('here8');
                    //const successCallback = () => res.status(200).send('Updated snippet information');
                    //const failureCallback = (err) => res.status(500).json(err);
                    //editSnippetGroup(snippetGroup, successCallback, failureCallback);
                } catch (err) {
                    console.log(err);
                    res.status(404).json({ error: 'Snippet group does not exist.' });
                }
/*
                try {
                    await Snippet.save(snippetsToInsert);
                } catch (err) {
                    console.log('Error: ', err);
                    res.status(500).json({ errors: err });
                    return;
                }*/
            }
        } else {
            res.json({ error: errors });
        }
    } else {
        res.json({ error: 'Must specify snippetGroupId' });
    }
})


export default snippetRoutes;