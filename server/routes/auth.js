import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db/db.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !username.trim() || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username.trim()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).send('Username not available.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username.trim(), hashedPassword]
        );

        res.status(201).send('Account created successfully!');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Internal server error.');
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !username.trim() || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username.trim()]
        );

        if (users.length === 0) {
            return res.status(401).send('Invalid username or password.');
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).send('Invalid username or password.');
        }

        res.status(200).send('Login successful!');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal server error.');
    }
});

export default router;