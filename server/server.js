import express from 'express';
import cors from 'cors';
import { pool } from './config/db/db.js';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 AS ok');
        res.json({ server: 'ok', database: rows[0].ok === 1 ? 'ok' : 'fel' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ server: 'ok', database: 'kunde inte ansluta' });
    }
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api', questionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));