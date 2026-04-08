import { test, after } from 'node:test';
import assert from 'node:assert';
import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import 'dotenv/config'
import Message from '../models/message.js';
import Room from '../models/room.js';

await mongoose.connect(process.env.MONGO_URI);

const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_msg', password: '123456' })
});
const { token } = await loginResponse.json();

const roomResponse = await fetch('http://localhost:3000/rooms', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ targetUsername: 'testuser_msg2' })
});
const room = await roomResponse.json();
console.log('room:', room);
const roomId = room._id;
console.log('roomId:', roomId);

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

    await new Promise(resolve => {
        socket.emit('joinRoom', roomId);
        setTimeout(resolve, 200);
    });

    socket.emit('sendMessage', { roomId, content: 'test message' });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const message = await Message.findOne({ content: 'test message' });
    assert.ok(message);

    await Message.deleteOne({ content: 'test message' });
    socket.disconnect();
});
after(async () => {
    await Room.deleteOne({ _id: roomId });
    await mongoose.disconnect();
});