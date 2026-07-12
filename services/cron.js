const cron = require('node-cron');
const Parser = require('rss-parser');
const db = require('../models/db');

const parser = new Parser();

// Government / employment RSS feeds (add more legitimate public feeds here)
const RSS_SOURCES = [
  // Example: { url: 'https://www.employmentnews.gov.in/rss', category: 'Central Govt' }
  // Add real RSS feed URLs from government/employment portals here.
];

async function checkJobFeeds() {
  console.log('[cron] Checking job RSS feeds...');
  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of feed.items.slice(0, 10)) {
        const exists = db.prepare('SELECT id FROM jobs WHERE title = ?').get(item.title);
        if (!exists) {
          db.prepare(`
            INSERT INTO jobs (title, category, apply_link, description, status, source, published)
            VALUES (?, ?, ?, ?, 'new', 'auto', 0)
          `).run(item.title, source.category, item.link, item.contentSnippet || '');
          console.log('[cron] New job added (unpublished, needs admin review):', item.title);
        }
      }
    } catch (err) {
      console.error('[cron] Failed to fetch feed:', source.url, err.message);
    }
  }
}

// Placeholder for AI-generated quiz questions.
// If ANTHROPIC_API_KEY is set, this calls the Anthropic API to draft
// original questions from current-affairs facts. Admin should review
// generated questions before they go live (they are inserted as active=0).
async function generateDailyQuizQuestions() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('[cron] Skipping AI quiz generation - no ANTHROPIC_API_KEY set. Add questions manually via admin panel.');
    return;
  }
  console.log('[cron] AI quiz generation would run here. Configure a news source and prompt, then review drafts in admin panel before publishing.');
  // Implementation intentionally left as a hook: wire up a news source,
  // call the Anthropic API to draft questions, and insert with active=0
  // so an admin reviews and approves each one before it goes live.
}

function startCronJobs() {
  // Every 6 hours: check for new job postings
  cron.schedule('0 */6 * * *', checkJobFeeds);

  // Daily at midnight: generate new quiz question drafts
  cron.schedule('0 0 * * *', generateDailyQuizQuestions);

  console.log('[cron] Scheduled jobs registered (job feed check every 6h, quiz draft generation daily at midnight)');
}

module.exports = { startCronJobs, checkJobFeeds, generateDailyQuizQuestions };
