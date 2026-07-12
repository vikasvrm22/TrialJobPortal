require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./models/db');
const { startCronJobs } = require('./services/cron');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hours
}));

// Make site config available in every view
app.use((req, res, next) => {
  res.locals.siteName = process.env.SITE_NAME || 'SarkariUpdate';
  res.locals.siteUrl = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
  res.locals.whatsappLink = process.env.WHATSAPP_LINK || '#';
  res.locals.telegramLink = process.env.TELEGRAM_LINK || '#';
  res.locals.isAdmin = !!(req.session && req.session.isAdmin);
  next();
});

// ---------- ROUTES ----------
app.use('/', require('./routes/public'));
app.use('/quiz', require('./routes/quiz'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
  startCronJobs();
});
