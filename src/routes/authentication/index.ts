import express from 'express';
const bcrypt = require('bcrypt');
const router = express.Router();
import User from '../../mongoose/models/User';
import { validateLogin, validateSignup } from '../../util/validation';

const saltRounds = 10;

/**
 * @route POST /auth/signup
 * @description Validates user, password, and pushes new User to database
 * @access Public
 */
 router.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    const {isValid, errors} = await validateSignup(email, password, confirmPassword);
    
    if (!isValid) { // Email or password are not valid
        res.status(500);
        res.send({error: errors});
    } else {
        // Email and password are valid

        // Hash and salt the password
        const hash = bcrypt.hashSync(password, saltRounds);
        // Save document to mongoDB
        let user;
        try {
            user = await User.create({ email, password: hash });
        } catch (err) {
            console.error('Error creating user: ', err);
            // Send error back
            res.status(500);
            res.send({
                error: errors
            })
        }

        // return HTTP 200 OK with redirect to '/login'
        const redirectURL = req.headers.host + '/login';
        res.status(200);
        res.header('location', redirectURL);
        res.end();
    }
});

/**
 * @route POST /auth/login
 * @description Validates user and returns JWT token
 * @access Public
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const {isValid, errors} = await validateLogin(email, password);

    if (!isValid) {
        res.status(500);
        res.send({error: errors})
    } else {
        // Check if password matches what is in the database
        const user: any = await User.findOne({ email }).exec();
        const passwordMatches = bcrypt.compareSync(password, user.password); // true

        if (!passwordMatches) {
            res.status(500);
            res.send({error: 'Incorrect password.'});
        } else {
            res.status(200);
            res.header('location', '/user/' + user._id);
            const userInfo = {
                name: user.name,
                email: user.email,
                info: user.info,
                publicSnippets: user.publicSnippets,
                privateSnippets: user.privateSnippets,
            }
            res.send(userInfo);
        }
    }
});

export default router;
