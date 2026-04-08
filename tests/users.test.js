/*
This file contains tests for the users search endpoint.
It tests searching for users by username, ensuring passwords are excluded,
and that authentication is required.
*/

import { test, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import User from '../models/user.js';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ua', password: '123456' })
});

 await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ub', password: '123456' })
});

await new Promise(resolve => setTimeout(resolve, 300));

const loginA = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ua', password: '123456' })
});
const { token } = await loginA.json();

test('search users - returns results excluding self', async () => {
    const response = await fetch('http://localhost:3000/users/search?q=testuser_u', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data));

    const usernames = data.map(u => u.username);
    assert.ok(usernames.includes('testuser_ub'));
    assert.ok(!usernames.includes('testuser_ua'));
});

test('search users - no password field in results', async () => {
    const response = await fetch('http://localhost:3000/users/search?q=testuser_ub', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(data.length > 0);
    assert.strictEqual(data[0].password, undefined);
});

test('search users - missing query param returns 400', async () => {
    const response = await fetch('http://localhost:3000/users/search', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    assert.strictEqual(response.status, 400);
});

test('search users - unauthenticated returns 401', async () => {
    const response = await fetch('http://localhost:3000/users/search?q=test');

    assert.strictEqual(response.status, 401);
});

after(async () => {
    await User.deleteOne({ username: 'testuser_ua' });
    await User.deleteOne({ username: 'testuser_ub' });
    await mongoose.disconnect();
});