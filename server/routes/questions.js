import express from 'express'
import { pool } from '../config/db/db.js';

const router = express.Router()

const FIELDS = [
  'quizId',
  'articleId',
  'type',
  'question',
  'questionImageUrl',
  'rightAnswer',
  'wrongAnswer1',
  'wrongAnswer2',
  'wrongAnswer3',
]

function pickFields(body) {
  return FIELDS.map((f) => body[f] ?? null)
}

function validate(body) {
  if (!body.quizId || !body.question || !body.rightAnswer || !body.wrongAnswer1) {
    return 'quizId, question, rightAnswer och wrongAnswer1 måste fyllas i'
  }
  if (body.type && !['multiple_choice', 'true_false'].includes(body.type)) {
    return "type måste vara 'multiple_choice' eller 'true_false'"
  }
  return null
}

router.get('/quiz/:quizId/questions', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM questions WHERE quizId = ? ORDER BY questionId',
    [req.params.quizId]
  )
  res.json(rows)
})

router.get('/questions/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM questions WHERE questionId = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Frågan hittades inte' })
  res.json(rows[0])
})

router.post('/questions', async (req, res) => {
  const error = validate(req.body)
  if (error) return res.status(400).json({ error })

  const [result] = await pool.execute(
    `INSERT INTO questions (${FIELDS.join(', ')}) VALUES (${FIELDS.map(() => '?').join(', ')})`,
    pickFields({ type: 'multiple_choice', ...req.body })
  )
  res.status(201).json({ questionId: result.insertId, ...req.body })
})


router.put('/questions/:id', async (req, res) => {
  const error = validate(req.body)
  if (error) return res.status(400).json({ error })

  const [result] = await pool.execute(
    `UPDATE questions SET ${FIELDS.map((f) => `${f} = ?`).join(', ')} WHERE questionId = ?`,
    [...pickFields({ type: 'multiple_choice', ...req.body }), req.params.id]
  )
  if (!result.affectedRows) return res.status(404).json({ error: 'Frågan hittades inte' })
  res.json({ questionId: Number(req.params.id), ...req.body })
})


router.delete('/questions/:id', async (req, res) => {
  const [result] = await pool.execute('DELETE FROM questions WHERE questionId = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Frågan hittades inte' })
  res.status(204).end()
})

export default router