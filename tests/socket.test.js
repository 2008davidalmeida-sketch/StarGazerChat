import { test, after } from 'node:test';
import assert from 'node:assert';
import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import 'dotenv/config'
import Message from '../models/message.js';

await mongoose.connect(process.env.MONGO_URI);

const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_msg', password: '123456' })
});
const data = await loginResponse.json();
const { token } = data;

test('IO connection', (t, done) => {
    const socket = io('http://localhost:3000', {
        auth: { token }
    });

    socket.on('connect', () => {
        socket.disconnect();
        done();
    });

    socket.on('connect_error', (err) => {
        done(err);
    });
});

test('send a message', async () => {
    const socket = io('http://localhost:3000', { auth: { token } });
    
    await new Promise(resolve => socket.on('connect', resolve));
    
    socket.emit('joinRoom', '69ca6ae99fe5ddf178e3b0df');
    socket.emit('sendMessage', { roomId: '69ca6ae99fe5ddf178e3b0df', content: 'test message' });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const message = await Message.findOne({ content: 'test message' });
    assert.ok(message);
    
    await Message.deleteOne({ content: 'test message' });
    socket.disconnect();
})


after(async () => {
    await mongoose.disconnect();
});
