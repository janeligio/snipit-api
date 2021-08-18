import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/keys';
import User from '../mongoose/models/User';
import { SnippetGroup } from '../mongoose/models/SnippetGroup';
import { Snippet } from '../mongoose/models/Snippet';
import { 
    validateLogin, 
    validateRegister, 
    validateLogin_v2, 
    ValidationMessage,
    validateEditUser,
    validateSnippetGroup
} from '../util/validation';

import uc from './user-controller';
import sc from './snippet-controller'

// Tested
async function register(req, res) {
    const { username, email, password, confirmPassword } = req.body;

    const { isValid, errors } = await validateRegister({ username, email, password, confirmPassword });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    } else {

        await uc.createUser({
            username,
            email,
            password,
            onSuccess: (token) => {
                console.log(token);

                const redirect = req.headers.host + '/login';
                res.header('location', redirect);
                res.status(200).json({ success: true, token: `Bearer ${token}`});
                return;
            },
            onError: (errorMessage) => {
                res.status(500).json({ error: errorMessage });
                return;
            }
        });

        return;
    }
}

// Tested
async function login(req, res) {
    const { username, email, password } = req.body;

    const { isValid, errors } = await validateLogin_v2({ username, email });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    } else {
        // Check if password matches what is in the database
        let searchBy;
        if (username && typeof username === 'string' && username.length > 0) searchBy = { username };
        else if (email && typeof email === 'string' && email.length > 0) searchBy = { email };

        const user: any = await User.findOne(searchBy, '_id username password').exec();
        const matches = await bcrypt.compare(password, user.password);
        if (!matches) {
            res.status(400);
            res.json({ error: 'Incorrect password.' });
            return;
        } else {
            res.header('location', '/user/' + user._id);
            // This is what will authenticate a user
            const payload = { id: user._id, username: user.username };
            // Sign the token
            // Eventully token sessions will be recorded in a cache
            jwt.sign(payload, jwtSecret, { expiresIn: '7d' }, (err, token) => {
                if (err) {
                    res.status(500).json({ error: 'Error authenticating' });
                } else {
                    // Note: Frontend & Backend must be on same domain for browser to set cookie.
                    // In the future, allow cors not to be from * (any) origin but specific origins.
                    // For development: allow from localhost:3000. For production, allow from whatever
                    // domain frontend is hosted.
                    res.cookie('jwt', `Bearer ${token}`, { httpOnly: true, maxAge: (60 * 60 * 24) });
                    // res.setHeader('Set-Cookie', `jwt=Bearer ${token}; HttpOnly`);
                    res.status(200).json({
                        success: true,
                        token: `Bearer ${token}`
                    });
                    return;
                }
            });
        }
    }
}

// Tested
async function getUserDataPublic(req, res) {
    const { userId, username } = req.query;

    const publicUserProps = 'date updated username name bio';
    const user = await uc.findUser({ id: userId, username, selectProps: publicUserProps });

    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }

    // Fetch user's snippet groups
    const snippetGroups = await sc.findUserSnippetGroups({ userId: user._id.toString(), hidden: false });

    const snippetPromises: Snippet[][] = [];

    for (const snippetGroup of snippetGroups) {
        snippetPromises.push(await sc.findSnippetGroupSnippets({ snippetGroupId: snippetGroup._id.toString() }));
    }

    const snippets = await Promise.all(snippetPromises);

    const mappedSnippetGroups = [];

    // Attach snippets to their snippet groups
    for (let i = 0; i < snippetGroups.length; i++) {
        const mappedSnippetGroup = { ...snippetGroups[i]._doc, snippets: snippets[i] };
        mappedSnippetGroups.push(mappedSnippetGroup);
    }

    res.status(200).json({ user, snippets: mappedSnippetGroups });
    return;
}

// Tested
async function getUserDataPrivate(req, res) {
    const { userId, username } = req.query;

    const privateUserProps = 'date updated username email name bio';

    const user = await uc.findUser({ id: userId, username, selectProps: privateUserProps });

    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }

    // Fetch user's snippet groups
    const snippetGroups = await sc.findUserSnippetGroups({ userId: user._id.toString(), hidden: true });

    const snippetPromises: Snippet[][] = [];

    for (const snippetGroup of snippetGroups) {
        snippetPromises.push(await sc.findSnippetGroupSnippets({ snippetGroupId: snippetGroup._id.toString() }));
    }

    const snippets = await Promise.all(snippetPromises);

    const mappedSnippetGroups = [];

    // Attach snippets to their snippet groups
    for (let i = 0; i < snippetGroups.length; i++) {
        const mappedSnippetGroup = { ...snippetGroups[i]._doc, snippets: snippets[i] };
        mappedSnippetGroups.push(mappedSnippetGroup);
    }

    res.status(200).json({ user, snippets: mappedSnippetGroups });
    return;
}

// Tested
// Can only change name and bio
async function editUser(req, res) {
    const { username } = req.query;
    const { name, bio } = req.body;

    // TODO: Validate name and bio
    const { isValid, errors } = await validateEditUser({ name, bio });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    }

    const userData: any = {};
    if (typeof name === 'string') userData.name = name;
    if (typeof bio === 'string') userData.bio = bio;

    await uc.editUser({
        username,
        userData, 
        onSuccess: (user) => {
            res.status(200).json({ success: true, user });
            return;
        }, 
        onError: (error) => {
            res.status(500).json({ error });
            return;
        }
    });

    return;
}

// Untested
// TODO: Delete snippet groups and snippets that belong to the user
async function deleteUser(req, res) {
    const { username } = req.query;

    await uc.deleteUser({
        username,
        onSuccess: (user) => {
            res.status(200).json({ success: true, user });
            return;
        },
        onError: (error) => {
            res.status(500).json({ error });
            return;
        }
    });

    return;
}

// Test more
async function getSnippetGroups(req, res) {

    const query: SnippetGroup = { hidden: false };

    const sortBy: 'ascending' | 'descending' = 'descending';
    const sort = { date: sortBy };

    const snippetGroups = await sc.querySnippetGroups({ query, sort });

    res.status(200).json({ snippetGroups });
    return;
}

// Tested
async function getSnippetGroup(req, res) {
    const { snippetGroupId } = req.params;

    if (!snippetGroupId) {
        res.status(400).json({ error: 'Snippet group id not provided.' });
        return;
    }

    const snippetGroup: SnippetGroup = await sc.findSnippetGroup({ snippetGroupId });
    
    if (!snippetGroup) {
        res.status(404).json({ error: 'Snippet group not found.' });
        return;
    }

    if (snippetGroup.hidden) {
        if (res.locals.auth?.id !== snippetGroup.userId.toString()) {
            res.status(403).json({ error: 'Forbidden.' });
            return;
        }
    }

    const snippets = await sc.findSnippetGroupSnippets({ snippetGroupId });

    res.status(200).json({ snippetGroup, snippets });
    return;

}

async function getUserSnippetGroups(req, res) {}

async function getUserSnippetGroup(req, res) {}

// Not 100% Tested
async function addUserSnippetGroup(req, res) {
    const { hidden, title, description, tags, snippets } = req.body;

    const { isValid, errors } = await validateSnippetGroup({ hidden, title, description, tags, snippets });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    }

    const userId = res.locals.auth.id;

    const snippetGroup = await sc.createSnippetGroup({
        snippetGroup: {
            userId,
            title,
            description,
            tags,
            hidden,
        }
    });

    const snippetGroupId = snippetGroup._id;

    const createdSnippets = await Promise.all(snippets.map(async (snippet: Snippet) => {
            snippet.userId = userId;
            snippet.snippetGroupId = snippetGroupId;
            return await sc.createSnippet({ snippet });
        }
    ));

    res.status(200).json({ success: true, snippetGroup, createdSnippets });
    return;
}

// Tested
async function editUserSnippetGroup(req, res) {
    const { snippetGroupId } = req.params;
    const { hidden, title, description, tags } = req.body;

    const { isValid, errors } = await validateSnippetGroup({ hidden, title, description, tags });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    }

    const snippetGroupData: SnippetGroup = {};
    if (typeof hidden !== 'undefined') snippetGroupData.hidden = hidden;
    if (typeof title !== 'undefined') snippetGroupData.title = title;
    if (typeof description !== 'undefined') snippetGroupData.description = description;
    if (typeof tags !== 'undefined') snippetGroupData.tags = tags;

    const updatedSnippetGroup = await sc.editSnippetGroup({ snippetGroupId, snippetGroupData });

    res.status(200).json({ success: true, snippetGroup: updatedSnippetGroup });
    return;
}

interface EditUserSnippetReq {
    params: {
        snippetId: string;
    };
    body: Snippet
}
async function editUserSnippet(req: EditUserSnippetReq, res) {
    const { snippetId } = req.params;
    
    const snippetData: Snippet = req.body;

    // TODO: Validate snippet data

    const updatedSnippet = await sc.editSnippet({ snippetId, snippetData });

    if (updatedSnippet) {
        res.status(200).json({ success: true, snippet: updatedSnippet });
        return;   
    }

    res.status(500).json({ error: 'Snippet not found.' });
    return;
}

// Tested
async function deleteUserSnippetGroup(req, res) {
    const { snippetGroupId } = req.params;

    const deletedSnippets = await sc.deleteSnippetGroupSnippets({ snippetGroupId });

    const deletedSnippetGroup = await sc.deleteSnippetGroup({ snippetGroupId });

    res.status(200).json({ success: true, deletedSnippetGroup, deletedSnippets });
}

const api = {
    register,
    login,
    getUserDataPublic,
    getUserDataPrivate,
    editUser,
    deleteUser,
    getSnippetGroups,
    getSnippetGroup,
    getUserSnippetGroups,
    getUserSnippetGroup,
    addUserSnippetGroup,
    editUserSnippetGroup,
    editUserSnippet,
    deleteUserSnippetGroup
};

export default api;