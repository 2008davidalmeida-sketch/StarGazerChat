import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';  
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { initSocket } from './sockets/chat.js';

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use('/auth', authRoutes);  
app.use('/messages', messageRoutes);  

initSocket(io);
server.listen(3000, () => console.log('Server running'));

