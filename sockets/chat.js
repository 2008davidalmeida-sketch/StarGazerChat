/*
This file initializes the Socket.IO server for real-time communication in the chat application. 
It includes middleware for authenticating users using JWT tokens, and defines event handlers for 
joining chat rooms, sending messages, and handling user disconnections. 
Messages are saved to the database and broadcasted to all users in the same chat room.
*/

import Message from '../models/message.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export function initSocket(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
        
            socket.user = decoded;
            next();
        });
    });
   
    io.on('connection', async (socket) => {
        try {
            await User.findByIdAndUpdate(socket.user.id, { status: "online" });
            console.log('User connected:', socket.id);
        } catch (error) {
            console.error('Error updating user status:', error);
        }

        socket.on('joinRoom', (roomId) => {
            console.log('joinRoom received:', roomId);
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('sendMessage', async (data) => {
            try {
                const { roomId, content } = data;
                if (!roomId || !content) return;

                const message = new Message({ sender: socket.user.id, content, room: roomId });
                await message.save();
                
                io.to(roomId).emit('newMessage', { senderId: socket.user.id, content });

            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', async () => {
            try {
                await User.findByIdAndUpdate(socket.user.id, { status: "offline" });
                console.log('User disconnected:', socket.id);
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        });
    });
}