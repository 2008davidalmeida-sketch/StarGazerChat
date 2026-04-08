/*
This file contains tests for the rooms endpoint.
It tests creating 1-on-1 rooms, preventing duplicates, fetching rooms,
and that authentication is required.
*/

import { test, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import User from '../models/user.js';
import Room from '../models/room.js';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ra', password: '123456' })
});

await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_rb', password: '123456' })
});

const loginA = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ra', password: '123456' })
});
const { token: tokenA } = await loginA.json();

test('create a new 1-on-1 room', async () => {
    const response = await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({ targetUsername: 'testuser_rb' })
    });
    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.ok(data._id);
    assert.strictEqual(data.members.length, 2);
    data.members.forEach(m => assert.strictEqual(m.password, undefined));
});

test('returns existing room instead of creating duplicate', async () => {
    await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({ targetUsername: 'testuser_b' })
    });

    const response = await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({ targetUsername: 'testuser_rb' })
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(data._id);
});

test('fetch rooms for logged-in user', async () => {
    const response = await fetch('http://localhost:3000/rooms', {
        headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
});

test('cannot create room with yourself', async () => {
    const response = await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({ targetUsername: 'testuser_ra' })
    });

    assert.strictEqual(response.status, 400);
});

test('create room - unauthenticated returns 401', async () => {
    const response = await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername: 'testuser_rb' })
    });

    assert.strictEqual(response.status, 401);
});

after(async () => {
    await User.deleteOne({ username: 'testuser_ra' });
    await User.deleteOne({ username: 'testuser_rb' });
    await Room.deleteMany({ members: { $exists: true } });
    await mongoose.disconnect();
});