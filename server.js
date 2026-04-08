/*
This file sets up the Express server, connects to MongoDB, and initializes the Socket.
IO server for real-time communication. 
It imports necessary routes for authentication and messaging, and starts the server on a specified port.
*/

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';  
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import roomRoutes from './routes/rooms.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { initSocket } from './sockets/chat.js';
import cors from 'cors';

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});

app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.json());
app.use('/auth', authRoutes);  
app.use('/messages', messageRoutes);  
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);

initSocket(io);
server.listen(3000, () => console.log('Server running'));

