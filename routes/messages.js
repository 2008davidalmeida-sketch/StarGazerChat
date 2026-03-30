import { Router } from 'express';
import { authMiddleware } from '../middleware/middleware.js';
import Message from '../models/message.js';

const router = Router();

router.get('/:roomId', authMiddleware, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 });
        res.send(messages);

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;