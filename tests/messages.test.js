import { test, after } from 'node:test';
import assert from 'node:assert';
import Message from '../models/message.js';
import mongoose from 'mongoose';
import 'dotenv/config'

await mongoose.connect(process.env.MONGO_URI);

const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_messages', password: '123456' })
});
const { token } = await loginResponse.json();
console.log('Token:', token);

test('send a new message', async () => {
    const response = await fetch('http://localhost:3000/messages/69ca6ae99fe5ddf178e3b0df', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' ,
            'Authorization': `Bearer ${token}`
        },
    });

    assert.strictEqual(response.status, 200);
});

after(async () => {
    await mongoose.disconnect();
});
