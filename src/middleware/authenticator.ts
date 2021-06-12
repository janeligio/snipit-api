import { jwtSecret } from '../config/keys';
import jwt from 'jsonwebtoken';

function getBearerTokenFromAuthHeader(authHeader: string): string {
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7, authHeader.length);
    }
    return '';
}

function verifyToken(token) {
    try {
        const decodedToken = jwt.verify(token, jwtSecret);
        return decodedToken.id;
    } catch (err) {
        return err;
    }
}

export function validateUserAuthenticity(locals, id) {
    console.log(locals);
    return locals.auth && locals.auth.id && id === locals.auth.id;
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
                const id = verifyToken(token);
                res.locals.auth = { id };
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