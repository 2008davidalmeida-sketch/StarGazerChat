/*
This file defines the routes for fetching users in the chat application.
It uses an authentication middleware to ensure that only authenticated users can access the users.  
It also handles searching for users by username and excluding the authenticated user from the results.
It also handles error cases such as missing query parameters and server errors.
*/

import express from 'express';
import User from '../models/user.js';
import { authMiddleware } from '../middleware/middleware.js';

const router = express.Router();

router.get('/search', authMiddleware, async (req, res) => {
    const query = req.query.q?.trim();

    if (!query) return res.status(400).json({ message: 'Query parameter q is required' });

    try {
        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: req.user.id }
        }).select('-password');

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;