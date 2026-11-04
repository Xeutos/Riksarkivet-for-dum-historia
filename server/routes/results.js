import express from 'express';
import { pool } from '../config/db/db.js';

const router = express.Router();

// Auto-migration: Ensure results table supports articleId and nullable quizId
async function ensureResultsColumns() {
  try {
    await pool.query('ALTER TABLE results ADD COLUMN articleId INT NULL');
  } catch (err) {
    // Column might already exist (code ER_DUP_FIELDNAME), ignore
  }
  try {
    await pool.query('ALTER TABLE results MODIFY COLUMN quizId INT NULL');
  } catch (err) {
    // Might already be nullable, ignore
  }
}
ensureResultsColumns();

// GET /api/results - Get all results (or filter by ?username=... or ?userId=...)
router.get('/results', async (req, res) => {
  const { username, userId } = req.query;

  try {
    let uid = userId;
    if (!uid && username) {
      const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (!users.length) {
        return res.json([]);
      }
      uid = users[0].id;
    }

    if (uid) {
      const [rows] = await pool.query(
        'SELECT * FROM results WHERE userId = ? ORDER BY completedAt DESC',
        [uid]
      );
      return res.json(rows);
    }

    // If no user filter provided, return the latest results (useful for admin / Postman testing)
    const [allRows] = await pool.query(
      'SELECT * FROM results ORDER BY completedAt DESC LIMIT 100'
    );
    res.json(allRows);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// GET /api/results/:id - Get a single result by resultId
router.get('/results/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM results WHERE resultId = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Resultatet hittades inte' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching result by id:', err);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

// POST /api/results
router.post('/results', async (req, res) => {
  const { username, userId, quizId, articleId, score, total } = req.body;

  if (score === undefined || total === undefined) {
    return res.status(400).json({ error: 'score and total are required' });
  }

  try {
    let uid = userId;
    if (!uid && username) {
      const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (users.length > 0) {
        uid = users[0].id;
      }
    }

    if (!uid) {
      return res.status(401).json({ error: 'User not found or not logged in' });
    }

    const [insertResult] = await pool.query(
      'INSERT INTO results (userId, quizId, articleId, score, total) VALUES (?, ?, ?, ?, ?)',
      [uid, quizId || null, articleId || null, score, total]
    );

    res.status(201).json({
      resultId: insertResult.insertId,
      userId: uid,
      quizId: quizId || null,
      articleId: articleId || null,
      score,
      total,
    });
  } catch (err) {
    console.error('Error saving result:', err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// PUT /api/results/:id - Update an existing result
router.put('/results/:id', async (req, res) => {
  const { score, total, quizId, articleId } = req.body;

  if (score === undefined && total === undefined && quizId === undefined && articleId === undefined) {
    return res.status(400).json({ error: 'Minst ett fält (score, total, quizId eller articleId) måste anges.' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM results WHERE resultId = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Resultatet hittades inte' });
    }

    const current = existing[0];
    const newScore = score !== undefined ? score : current.score;
    const newTotal = total !== undefined ? total : current.total;
    const newQuizId = quizId !== undefined ? quizId : current.quizId;
    const newArticleId = articleId !== undefined ? articleId : current.articleId;

    await pool.query(
      'UPDATE results SET score = ?, total = ?, quizId = ?, articleId = ? WHERE resultId = ?',
      [newScore, newTotal, newQuizId, newArticleId, req.params.id]
    );

    res.json({
      resultId: Number(req.params.id),
      userId: current.userId,
      quizId: newQuizId,
      articleId: newArticleId,
      score: newScore,
      total: newTotal,
      completedAt: current.completedAt,
    });
  } catch (err) {
    console.error('Error updating result:', err);
    res.status(500).json({ error: 'Failed to update result' });
  }
});

// DELETE /api/results/:id - Delete a result
router.delete('/results/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM results WHERE resultId = ?', [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Resultatet hittades inte' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

export default router;

