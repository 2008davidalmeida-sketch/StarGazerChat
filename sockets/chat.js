import Message from '../models/message.js';
import jwt from 'jsonwebtoken';

export function initSocket(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            socket.user = decoded;
            next();
        });
    });
   
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('sendMessage', async (data) => {
            try {
                const { roomId, content } = data;
                const message = new Message({ sender: socket.user.id, content, room: roomId });
                await message.save();
                io.to(roomId).emit('newMessage', { senderId: socket.user.id, content });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}