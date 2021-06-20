import express from 'express'
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator'
import { validateSnippet } from '../util/validation';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet'

const snippetRoutes = express.Router()

// Get all public snippets
snippetRoutes.get('/all', (req, res) => { })

// Get specific snippet
snippetRoutes.get('/:snippetId', (req, res) => { })

// Get someone's snippets
snippetRoutes.get('/:userId', (req, res) => { })

// Post a snippet - AUTHENTICATION REQUIRED
snippetRoutes.post('/create', (req, res) => { })

// Delete a snippet - AUTHENTICATION & AUTHORIZATION REQUIRED
snippetRoutes.delete('/delete', (req, res) => { })

// Edit a snippet - AUTHENTICATION & AUTHORIZATION REQUIRED
snippetRoutes.put('/edit', (req, res) => { })

export default snippetRoutes;