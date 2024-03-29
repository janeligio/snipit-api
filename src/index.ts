import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './mongoose/mongoose';
import api from './controllers/api-controller';
import { authenticateUser, authorizeUser, authorizeUserSnippetGroup, checkAuthentication } from './middleware/authenticator';

const server = express()
    .use(cors())
    .use(express.json())

    // Authentication/Authorization routes
    .post(  '/api/v2/auth/register', api.register)
    .post(  '/api/v2/auth/login', api.login)

    // User routes
    .get(   '/api/v2/user/public', api.getUserDataPublic)
    .get(   '/api/v2/user/private', authenticateUser, authorizeUser, api.getUserDataPrivate)
    .put(   '/api/v2/user', authenticateUser, authorizeUser, api.editUser)
    .delete('/api/v2/user', authenticateUser, authorizeUser, api.deleteUser)

    // Snippet routes
    .get(   '/api/v2/snippet-groups/', api.getSnippetGroups)
    .get(   '/api/v2/snippet-group/:snippetGroupId', checkAuthentication, api.getSnippetGroup)

    // User-Snippet routes
    .get(   '/api/v2/user/:userId/snippet-groups', api.getUserSnippetGroups)
    .get(   '/api/v2/user/:userId/snippet-group/:snippetGroupId', api.getUserSnippetGroup)
    .post(  '/api/v2/user/snippet-group', authenticateUser, api.addUserSnippetGroup)
    .put(   '/api/v2/user/snippet-group/:snippetGroupId', authenticateUser, authorizeUserSnippetGroup, api.editUserSnippetGroup)
    .delete('/api/v2/user/snippet-group/:snippetGroupId', authenticateUser, authorizeUserSnippetGroup, api.deleteUserSnippetGroup)
    .put(   '/api/v2/user/snippet/:snippetId', authenticateUser, authorizeUserSnippetGroup, api.editUserSnippet)
    .delete('/api/v2/user/snippet/:snippetId', authenticateUser, authorizeUserSnippetGroup, api.deleteUserSnippetGroup)
    ;

let port: any;

if (process.env.NODE_ENV === 'production') {
    port = process.env.PORT;
} else {
    port = 3001;
}

server.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server listening on localhost:${port}`);
});
