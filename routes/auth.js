/*
This file contains the routes for user authentication, including registration and login.
It uses bcrypt for password hashing and jsonwebtoken for token generation. 
The routes handle user input validation, check for existing users, and return appropriate responses 
based on the success or failure of the operations.
*/

import { Router } from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateAuthLogin, validateAuthRegister } from '../utils/validateAuth.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const error = validateAuthRegister(username, password);
        if (error) return res.status(400).json({ message: error });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username : username,
            password : hashedPassword,

        });
        await user.save();
        res.json({ message: 'User created successfully' });
        
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
       
        const error = validateAuthLogin(username, password);
        if (error) return res.status(400).json({ message: error });
       
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ message: 'User does not exist'});
    
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: 'Incorrect password'});

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;