import { test, after } from 'node:test';
import assert from 'node:assert';
import User from '../models/user.js';
import mongoose from 'mongoose';
import 'dotenv/config'

await mongoose.connect(process.env.MONGO_URI);

test('register a new user', async () => {
    const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: `testuser`, password: '123456' })
    });

    assert.strictEqual(response.status, 200);
});

test('login a user', async () => {
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: '123456' })
    });
    const data = await response.json();
    assert.ok(data.token);

    assert.strictEqual(response.status, 200);
});

after(async () => {
    await User.deleteOne({ username: 'testuser' });
    await mongoose.disconnect();
});