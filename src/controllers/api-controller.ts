import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../mongoose/models/User';
import { jwtSecret } from '../config/keys';
import { 
    validateLogin, 
    validateRegister, 
    validateLogin_v2, 
    ValidationMessage,
    validateEditUser,
    validateSnippetGroup
} from '../util/validation';

import { 
    createUser,
    deleteUser as _deleteUser,
    editUser as _editUser,
    findUser
} from './user-controller';

import {
    createSnippetGroup,
    createSnippet,
    deleteSnippetGroup,
    deleteSnippet,
    editSnippetGroup,
    editSnippet,
    findSnippetGroup,
    findSnippetGroupWithSnippets,
    findSnippet,
    findUserSnippetGroups,
    SnippetGroup
} from './snippet-controller'

// Tested
async function register(req, res) {
    const { username, email, password, confirmPassword } = req.body;

    const { isValid, errors } = await validateRegister({ username, email, password, confirmPassword });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    } else {

        await createUser({
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
    const user = await findUser({ id: userId, username, selectProps: publicUserProps });

    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }

    // Fetch user's snippet groups
    const snippetGroups = await findUserSnippetGroups({ userId: user._id.toString(), hidden: false });

    res.status(200).json({ user, snippets: snippetGroups });
    return;
}

// Tested
async function getUserDataPrivate(req, res) {
    const { userId, username } = req.query;

    const privateUserProps = 'date updated username email name bio';

    const user = await findUser({ id: userId, username, selectProps: privateUserProps });

    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }

    // Fetch user's snippet groups
    const snippetGroups = await findUserSnippetGroups({ userId: user._id.toString(), hidden: true });

    res.status(200).json({ user, snippets: snippetGroups });
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

    await _editUser({
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
async function deleteUser(req, res) {
    const { username } = req.query;

    await _deleteUser({
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

async function getSnippetGroups(req, res) {}

async function getSnippetGroup(req, res) {}

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

    const snippetGroup = await createSnippetGroup({
        snippetGroup: {
            userId,
            title,
            description,
            tags,
            hidden,
        }
    });

    const snippetGroupId = snippetGroup._id;

    const createdSnippets = await Promise.all(snippets.map(async (snippet) => {
            snippet.userId = userId;
            snippet.snippetGroupId = snippetGroupId;
            return await createSnippet({ snippet });
        }
    ));

    res.status(200).json({ success: true, snippetGroup, createdSnippets });
    return;
}

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

    await editSnippetGroup({
        snippetGroupId,
        snippetGroupData,
        onSuccess: (updatedSnippetGroup) => {
            res.status(200).json({ success: true, snippetGroup: updatedSnippetGroup });
            return;
        },
        onError: (error) => {
            res.status(500).json({ error });
            return;
        }
    });
}

async function deleteUserSnippetGroup(req, res) {}

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
    deleteUserSnippetGroup
};

export default api;