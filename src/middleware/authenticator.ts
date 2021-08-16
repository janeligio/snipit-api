import { jwtSecret } from '../config/keys';
import jwt from 'jsonwebtoken';
import { findSnippetGroup } from '../controllers/snippet-controller';

function getBearerTokenFromAuthHeader(authHeader: string): string {
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7, authHeader.length);
    }
    return '';
}

function verifyToken(token) {
    try {
        const decodedToken = jwt.verify(token, jwtSecret);
        return { id: decodedToken.id, username: decodedToken.username };
    } catch (err) {
        return err;
    }
}

export function validateUserAuthenticity(locals, id) {
    return locals.auth && locals.auth.id && id.toString() === locals.auth.id;
}

export function validateUserAuthenticityId(locals, id) {
    return locals.auth && locals.auth.id && id.toString() === locals.auth.id;
}

export function validateUserAuthenticityUsername(locals, username) {
    return locals.auth && locals.auth.username && username === locals.auth.username;
}

export function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({ error: 'FORBIDDEN' });
    } else {
        // Extract token from authorization header
        const token = getBearerTokenFromAuthHeader(authHeader);

        if (token) {
            try {
                const { id, username } = verifyToken(token);
                res.locals.auth = { id, username };
                console.log('Set res.locals.auth to: ', res.locals.auth);
                console.log('User authenticated.');
                next();
            } catch (err) {
                return res.status(401).json({ message: 'UNAUTHORIZED' });
            }
        } else {
            // No token
            return res.status(403).json({ error: 'FORBIDDEN' });
        }
    }
}

// Sets res.locals.auth to the user's id and username
// if the user is authenticated.
// If the user is not authenticated, res.locals.auth is set to null.
// For routes where authentication is optional
export function checkAuthentication(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        try {
            const { id, username } = verifyToken(getBearerTokenFromAuthHeader(authHeader));
            res.locals.auth = { id, username };
            console.log('Set res.locals.auth to: ', res.locals.auth);
            console.log('User authenticated.');
        } catch (err) {
            console.log('Invalid JWT');
        }
    }

    next();
}

export function authorizeUser(req, res, next) {
    const { id, username } = req.query;

    if (username && typeof username === 'string' && username.length > 0) {
        if (validateUserAuthenticityUsername(res.locals, username)) {
            console.log('User authorized.')
            next();
        } else {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }
    } else if (id && typeof id === 'string' && id.length > 0) {
        if (validateUserAuthenticityId(res.locals, id)) {
            console.log('User authorized.')
            next();
        } else {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }
    } else {
        res.status(400);
        res.json({ errors: 'Must provide id or username query' });
        return;
    }
}

/** 
 * Authorize user has access to a specific snippet group.
 * */
export async function authorizeUserSnippetGroup(req, res, next) {
    const { snippetGroupId } = req.params;

    if (snippetGroupId && typeof snippetGroupId === 'string' && snippetGroupId.length > 0) {
        const snippetGroup: any = await findSnippetGroup({ snippetGroupId });

        if (!snippetGroup) {
            res.status(404).json({ errors: 'Snippet group does not exist.' });
        } else {
            const { userId } = snippetGroup;
            
            if (validateUserAuthenticityId(res.locals, userId)) {
                console.log('User is authorized to view snippet group.');
                next();
            } else {
                res.status(403).json({ error: 'FORBIDDEN: User does not have access to this snippet group.' });
            }
        }
    } else {
        res.status(400);
        res.json({ errors: 'Must provide snippetGroupId query' });
        return;
    }
}