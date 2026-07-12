const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data.sqlite'));
db.pragma('journal_mode = WAL');

// ---------- SCHEMA ----------
db.exec(`
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  posts TEXT,
  qualification TEXT,
  last_date TEXT,
  apply_link TEXT,
  description TEXT,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'manual',
  published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL,
  topic TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  score INTEGER,
  total INTEGER,
  question_ids TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// ---------- SEED DATA (only runs once, if tables are empty) ----------
const jobCount = db.prepare('SELECT COUNT(*) as c FROM jobs').get().c;
if (jobCount === 0) {
  const insertJob = db.prepare(`
    INSERT INTO jobs (title, category, posts, qualification, last_date, apply_link, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertJob.run(
    'SSC CGL 2026 Recruitment',
    'Central Govt',
    '8500',
    'Graduate',
    '2026-07-28',
    'https://ssc.nic.in',
    'Staff Selection Commission Combined Graduate Level Examination 2026 ke liye online applications aamantrit hain.',
    'new'
  );
  insertJob.run(
    'IBPS PO Recruitment 2026',
    'Banking',
    '3500',
    'Graduate',
    '2026-08-15',
    'https://ibps.in',
    'Institute of Banking Personnel Selection dwara Probationary Officer ke padon ke liye bharti.',
    'new'
  );
  insertJob.run(
    'Railway RRB Group D',
    'Railway',
    '32000',
    '10th Pass',
    '2026-08-05',
    'https://rrbcdg.gov.in',
    'Railway Recruitment Board dwara Group D posts ke liye vacancy.',
    'apply'
  );
}

const quizCount = db.prepare('SELECT COUNT(*) as c FROM quiz_questions').get().c;
if (quizCount === 0) {
  const insertQ = db.prepare(`
    INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_option, topic)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const sample = [
    ['Bharat ka rashtriya khel kaunsa hai?', 'Hockey', 'Cricket', 'Kabaddi', 'Football', 'A', 'General Knowledge'],
    ['ISRO ka headquarters kahan hai?', 'Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'B', 'Science'],
    ['Bharat ke current Rashtrapati kaun hain?', 'Droupadi Murmu', 'Ram Nath Kovind', 'Pranab Mukherjee', 'A P J Abdul Kalam', 'A', 'Polity'],
    ['RBI ka full form kya hai?', 'Reserve Bank of India', 'Regional Bank of India', 'Rural Bank of India', 'Royal Bank of India', 'A', 'Economy'],
    ['Bharat ka sabse lamba nadi kaunsi hai?', 'Yamuna', 'Ganga', 'Godavari', 'Brahmaputra', 'B', 'Geography']
  ];
  for (const q of sample) insertQ.run(...q);
}

module.exports = db;
