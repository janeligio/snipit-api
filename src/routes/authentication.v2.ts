import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../mongoose/models/User';
import { validateLogin, validateRegister, validateLogin_v2, ValidationMessage } from '../util/validation';
import { jwtSecret } from '../config/keys';
import { createUser } from '../controllers/user-controller';

const authRoutes = express.Router();

/**
 * 
 * */
authRoutes.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    const { isValid, errors } = await validateRegister({ username, email, password, confirmPassword });

    if (!isValid) {
        res.status(400);
        res.json({ error: errors });
        return;
    } else {

        createUser({
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
});

authRoutes.post('/login', async (req, res) => {
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
});


export default authRoutes;