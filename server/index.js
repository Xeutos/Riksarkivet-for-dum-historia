import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './db/db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 AS ok');
    res.json({ server: 'ok', database: rows[0].ok === 1 ? 'ok' : 'fel' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ server: 'ok', database: 'kunde inte ansluta' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servern kör på http://localhost:${PORT}`));