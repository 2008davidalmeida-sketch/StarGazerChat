/*
This file contains tests for the messaging functionality of the chat application. 
It tests the retrieval of messages from a specific chat room by sending an HTTP GET request to the messages endpoint. 
The test checks if the response status is 200, indicating that the messages were successfully retrieved. 
After the test is completed, it disconnects from MongoDB.
*/

import { test, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import 'dotenv/config'

await mongoose.connect(process.env.MONGO_URI);

const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_msg', password: '123456' })
});
const data = await loginResponse.json();
const { token } = data;

test('fetch messages', async () => {
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
