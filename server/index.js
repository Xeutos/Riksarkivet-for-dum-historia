import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Read .env from project root
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });


const app = express();
app.use(cors());
app.use(express.json());

// 1. Create databasepool for MySQL
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. Endpoint: Register new user
app.post('/api/auth/register', async (req, res) => {
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

// 3. Endpoint: Log in
app.post('/api/auth/login', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));