import express from 'express';
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator';
import User from '../mongoose/models/User';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet';

const userRoutes = express.Router();

// Access user information (private) - AUTHENTICATION & AUTHORIZATION REQUIRED
userRoutes.get('/private', (req, res) => { })

// Access user information (public)
userRoutes.get('/public', (req, res) => { })

export default userRoutes;