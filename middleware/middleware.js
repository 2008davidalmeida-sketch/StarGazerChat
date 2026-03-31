/*
This file contains the authentication middleware for the chat application. 
It verifies JWT tokens sent in the Authorization header of incoming requests. 
If the token is valid, it decodes the token and attaches the user information to the request object, 
allowing access to protected routes. 
If the token is missing or invalid, it returns a 401 Unauthorized response.
*/

import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });

}