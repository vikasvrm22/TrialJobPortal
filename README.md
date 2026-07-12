# Sarkari Portal

Government job aggregator with daily current affairs quiz and admin panel.

## Features

- Homepage with latest jobs, category filters
- Job detail pages with apply links
- Daily current affairs quiz — 20 random questions per attempt from a question pool
- Admin panel (login-protected) to manage jobs and quiz questions
- WhatsApp / Telegram channel buttons throughout the site
- Disclaimer page for legal protection
- Auto job-checking via RSS (add your feed URLs in `services/cron.js`)

## Local Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your admin login
- `SESSION_SECRET` — any random long string
- `WHATSAPP_LINK` / `TELEGRAM_LINK` — your actual channel/group links

Then run:
```bash
npm start
```

Visit `http://localhost:3000` for the site, `http://localhost:3000/admin` for the admin panel.

## Admin Panel

Login at `/admin` with the credentials from your `.env` file. From there you can:
- Add / edit / delete job listings
- Add / edit / delete quiz questions
- See dashboard stats (total jobs, quiz attempts, etc.)

## Deploying (Railway — recommended)

1. Push this project to a GitHub repository
2. Go to railway.app → New Project → Deploy from GitHub repo
3. Add the environment variables from `.env.example` in Railway's Variables tab
4. Railway auto-detects Node.js and runs `npm start`
5. Your site goes live at a `*.up.railway.app` URL (you can add a custom domain later)

Note: this project uses SQLite (a single `data.sqlite` file) for simplicity — no
separate database server needed. On Railway, add a persistent volume mounted
at the project root so the database file survives redeploys.

## Auto Job Updates (RSS)

Open `services/cron.js` and add real RSS feed URLs to the `RSS_SOURCES` array,
for example from employment or government portals that publish public RSS feeds.
New jobs from feeds are added as **unpublished drafts** — review and publish them
from the admin panel before they go live on the site.

## AI-Generated Quiz Questions (optional)

If you set `ANTHROPIC_API_KEY` in `.env`, the daily cron hook in
`services/cron.js` (`generateDailyQuizQuestions`) is ready to be wired up to
call the Anthropic API and draft original questions from current-affairs facts.
Generated questions should be inserted as inactive so you can review and
approve them in the admin panel before they appear to users.

## Legal Note

This is an independent aggregator, not affiliated with any government body.
Only use publicly available information (RSS feeds, official notifications)
and always link back to the official source for applications. The disclaimer
page (`/disclaimer`) covers this — keep it visible and accurate.
