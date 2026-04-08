/*
This file contains the routes for managing chat rooms.
It handles fetching all rooms the user is a member of and creating new rooms.
It uses an authentication middleware to ensure that only authenticated users can
access the rooms. It also handles creating new rooms and populating them with
user data. It prevents users from creating rooms with themselves and prevents
creating duplicate rooms. It also handles error cases such as user not found
and server errors.
*/

import express from 'express';
import Room from '../models/room.js';
import User from '../models/user.js';
import Message from '../models/message.js';
import { authMiddleware } from '../middleware/middleware.js';
import mongoose from 'mongoose';


const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const rooms = await Room.find({ members: new mongoose.Types.ObjectId(req.user.id) })
            .populate('members', '-password');

        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { targetUsername } = req.body;

    if (!targetUsername) return res.status(400).json({ message: 'targetUsername is required' });

    try {
        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (targetUser._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot create a room with yourself' });
        }

      
        const existingRoom = await Room.findOne({
            members: { $all: [req.user.id, targetUser._id], $size: 2 }
        }).populate('members', '-password');

        if (existingRoom) return res.json(existingRoom);

      
        const room = new Room({
            name: `${req.user.id}-${targetUser._id}`,
            members: [req.user.id, targetUser._id]
        });

        await room.save();

        const populated = await room.populate('members', '-password');
        res.status(201).json(populated);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:roomId', authMiddleware, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);

        if (!room) return res.status(404).json({ message: 'Room not found' });

        const isMember = room.members.some(m => m.toString() === req.user.id);
        if (!isMember) return res.status(403).json({ message: 'Not a member of this room' });

        await Room.deleteOne({ _id: room._id });
        await Message.deleteMany({ room: room._id });

        res.json({ message: 'Room deleted' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;