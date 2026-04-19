/*
This file defines the Mongoose schema and model for the User collection in the MongoDB database. 
It includes fields for username, password, and status (online/offline), along with timestamps for 
record creation and updates. The model is exported for use in other parts of the application, such as 
authentication and user management.
*/

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    bio: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model('User', userSchema);