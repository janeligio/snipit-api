import express from 'express'
import { authenticateUser, authorizeUser } from '../middleware/authenticator'
import { validateSnippet } from '../util/validation';
import SnippetGroup from '../mongoose/models/SnippetGroup';
import Snippet from '../mongoose/models/Snippet'

const snippetRoutes = express.Router()

// Get all public snippets
snippetRoutes.get('/all', async (req, res) => { })

// Get specific snippet
// Check if private field is true/false
//  If user is owner of snippet, return snippet
//  else return FORBIDDEN status code
snippetRoutes.get('/:snippetId', async (req, res) => { })


// Get someone's snippets
// 
// snippetRoutes.get('/:userId', (req, res) => { })

// Post a snippet - AUTHENTICATION REQUIRED
snippetRoutes.post('/create', authenticateUser, async (req, res) => { })

// Delete a snippet - AUTHENTICATION & AUTHORIZATION REQUIRED
// First check if user is owner of snippet
snippetRoutes.delete('/delete', authenticateUser, async (req, res) => { })

// Edit a snippet - AUTHENTICATION & AUTHORIZATION REQUIRED
// First check if user is owner of snippet
snippetRoutes.put('/edit', authenticateUser, async (req, res) => { })

export default snippetRoutes;