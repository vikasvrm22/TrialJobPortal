const express = require('express');
const router = express.Router();
const db = require('../models/db');

// ---------- AUTH MIDDLEWARE ----------
function requireLogin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

// ---------- LOGIN ----------
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'changeme123';

  if (username === validUser && password === validPass) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: 'Galat username ya password' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ---------- DASHBOARD ----------
router.get('/', requireLogin, (req, res) => {
  const stats = {
    totalJobs: db.prepare('SELECT COUNT(*) as c FROM jobs').get().c,
    publishedJobs: db.prepare('SELECT COUNT(*) as c FROM jobs WHERE published = 1').get().c,
    totalQuestions: db.prepare('SELECT COUNT(*) as c FROM quiz_questions').get().c,
    totalAttempts: db.prepare('SELECT COUNT(*) as c FROM quiz_attempts').get().c,
    avgScore: db.prepare('SELECT AVG(score) as avg FROM quiz_attempts').get().avg || 0
  };
  res.render('admin/dashboard', { stats });
});

// ---------- JOBS MANAGEMENT ----------
router.get('/jobs', requireLogin, (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
  res.render('admin/jobs', { jobs });
});

router.get('/jobs/new', requireLogin, (req, res) => {
  res.render('admin/job-form', { job: null });
});

router.post('/jobs/new', requireLogin, (req, res) => {
  const { title, category, posts, qualification, last_date, apply_link, description, status } = req.body;
  db.prepare(`
    INSERT INTO jobs (title, category, posts, qualification, last_date, apply_link, description, status, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(title, category, posts, qualification, last_date, apply_link, description, status);
  res.redirect('/admin/jobs');
});

router.get('/jobs/:id/edit', requireLogin, (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.redirect('/admin/jobs');
  res.render('admin/job-form', { job });
});

router.post('/jobs/:id/edit', requireLogin, (req, res) => {
  const { title, category, posts, qualification, last_date, apply_link, description, status, published } = req.body;
  db.prepare(`
    UPDATE jobs SET title=?, category=?, posts=?, qualification=?, last_date=?, apply_link=?, description=?, status=?, published=?
    WHERE id=?
  `).run(title, category, posts, qualification, last_date, apply_link, description, status, published ? 1 : 0, req.params.id);
  res.redirect('/admin/jobs');
});

router.post('/jobs/:id/delete', requireLogin, (req, res) => {
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
  res.redirect('/admin/jobs');
});

// ---------- QUIZ QUESTIONS MANAGEMENT ----------
router.get('/quiz-questions', requireLogin, (req, res) => {
  const questions = db.prepare('SELECT * FROM quiz_questions ORDER BY created_at DESC').all();
  res.render('admin/quiz-questions', { questions });
});

router.get('/quiz-questions/new', requireLogin, (req, res) => {
  res.render('admin/quiz-question-form', { q: null });
});

router.post('/quiz-questions/new', requireLogin, (req, res) => {
  const { question, option_a, option_b, option_c, option_d, correct_option, topic } = req.body;
  db.prepare(`
    INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_option, topic, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(question, option_a, option_b, option_c, option_d, correct_option, topic);
  res.redirect('/admin/quiz-questions');
});

router.get('/quiz-questions/:id/edit', requireLogin, (req, res) => {
  const q = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(req.params.id);
  if (!q) return res.redirect('/admin/quiz-questions');
  res.render('admin/quiz-question-form', { q });
});

router.post('/quiz-questions/:id/edit', requireLogin, (req, res) => {
  const { question, option_a, option_b, option_c, option_d, correct_option, topic, active } = req.body;
  db.prepare(`
    UPDATE quiz_questions SET question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, topic=?, active=?
    WHERE id=?
  `).run(question, option_a, option_b, option_c, option_d, correct_option, topic, active ? 1 : 0, req.params.id);
  res.redirect('/admin/quiz-questions');
});

router.post('/quiz-questions/:id/delete', requireLogin, (req, res) => {
  db.prepare('DELETE FROM quiz_questions WHERE id = ?').run(req.params.id);
  res.redirect('/admin/quiz-questions');
});

module.exports = router;
