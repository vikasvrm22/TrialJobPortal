const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Landing page for quiz
router.get('/', (req, res) => {
  const totalQuestions = db.prepare('SELECT COUNT(*) as c FROM quiz_questions WHERE active = 1').get().c;
  const attemptsToday = db.prepare(`
    SELECT COUNT(*) as c FROM quiz_attempts WHERE date(created_at) = date('now')
  `).get().c;
  res.render('quiz-start', {
    totalQuestions, attemptsToday, active: 'quiz',
    pageTitle: 'Daily Current Affairs Quiz',
    metaDescription: 'Free daily current affairs quiz - 20 naye questions har din, turant result. Government exam preparation ke liye perfect.',
    canonicalPath: '/quiz'
  });
});

// Start a new attempt - picks 20 random questions from the pool
router.get('/play', (req, res) => {
  const questions = db.prepare(`
    SELECT id, question, option_a, option_b, option_c, option_d, topic
    FROM quiz_questions WHERE active = 1
    ORDER BY RANDOM() LIMIT 20
  `).all();

  if (questions.length === 0) {
    return res.render('quiz-empty');
  }

  req.session.quizQuestionIds = questions.map(q => q.id);
  res.render('quiz-play', {
    questions, active: 'quiz',
    pageTitle: 'Quiz - Answer karein',
    noIndex: true,
    canonicalPath: '/quiz/play'
  });
});

// Submit answers, calculate score
router.post('/submit', (req, res) => {
  const questionIds = req.session.quizQuestionIds || [];
  if (questionIds.length === 0) {
    return res.redirect('/quiz');
  }

  const placeholders = questionIds.map(() => '?').join(',');
  const questions = db.prepare(`SELECT * FROM quiz_questions WHERE id IN (${placeholders})`).all(...questionIds);

  let score = 0;
  const results = questions.map(q => {
    const userAnswer = req.body['q_' + q.id] || null;
    const isCorrect = userAnswer === q.correct_option;
    if (isCorrect) score++;
    return {
      question: q.question,
      userAnswer,
      correctAnswer: q.correct_option,
      isCorrect,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d }
    };
  });

  db.prepare('INSERT INTO quiz_attempts (session_id, score, total, question_ids) VALUES (?, ?, ?, ?)')
    .run(req.sessionID, score, questions.length, JSON.stringify(questionIds));

  req.session.quizQuestionIds = null;

  res.render('quiz-result', {
    score, total: questions.length, results, active: 'quiz',
    pageTitle: 'Quiz Result',
    noIndex: true,
    canonicalPath: '/quiz/submit'
  });
});

module.exports = router;
