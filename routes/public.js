const express = require('express');
const router = express.Router();
const db = require('../models/db');

const CATEGORIES = ['Central Govt', 'State Govt', 'Banking', 'Railway', 'Defence'];

router.get('/', (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs WHERE published = 1 ORDER BY created_at DESC LIMIT 20').all();
  const counts = {};
  for (const cat of CATEGORIES) {
    counts[cat] = db.prepare('SELECT COUNT(*) as c FROM jobs WHERE category = ? AND published = 1').get(cat).c;
  }
  res.render('home', {
    jobs, counts, categories: CATEGORIES, active: 'home',
    pageTitle: 'Latest Govt Jobs, Results & Admit Cards',
    metaDescription: 'Latest sarkari naukri, results, admit cards aur daily current affairs quiz - sab ek jagah. Free WhatsApp aur Telegram alerts ke saath.',
    metaKeywords: 'sarkari naukri, government jobs, sarkari result, admit card, current affairs quiz',
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: res.locals.siteName,
      url: res.locals.siteUrl
    }
  });
});

router.get('/jobs', (req, res) => {
  const category = req.query.category || null;
  const status = req.query.status || null;
  let query = 'SELECT * FROM jobs WHERE published = 1';
  const params = [];
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';
  const jobs = db.prepare(query).all(...params);
  res.render('jobs', {
    jobs, categories: CATEGORIES, activeCategory: category, activeStatus: status, active: 'jobs',
    pageTitle: category ? `${category} Jobs` : 'All Government Jobs',
    metaDescription: category
      ? `Latest ${category} government job vacancies - eligibility, last date aur apply link ke saath.`
      : 'Saari latest government job vacancies ek jagah - Central Govt, State Govt, Banking, Railway aur Defence.',
    canonicalPath: '/jobs' + (category ? `?category=${encodeURIComponent(category)}` : '')
  });
});

router.get('/jobs/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND published = 1').get(req.params.id);
  if (!job) return res.status(404).render('404', { active: '' });

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.title,
    datePosted: job.created_at.split(' ')[0],
    validThrough: job.last_date || undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.category
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressCountry: 'IN' }
    }
  };

  res.render('job-detail', {
    job, active: 'jobs',
    pageTitle: job.title,
    metaDescription: (job.description || job.title).slice(0, 155),
    canonicalPath: `/jobs/${job.id}`,
    jsonLd
  });
});

router.get('/disclaimer', (req, res) => {
  res.render('disclaimer', {
    active: 'disclaimer',
    metaDescription: `${res.locals.siteName} disclaimer - yeh ek independent information portal hai, kisi sarkari department se sambandhit nahi.`,
    canonicalPath: '/disclaimer'
  });
});

router.get('/about', (req, res) => {
  res.render('about', {
    active: 'about',
    metaDescription: `${res.locals.siteName} ke baare mein jaanein - government job updates aur daily quiz platform.`,
    canonicalPath: '/about'
  });
});

router.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${res.locals.siteUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const jobs = db.prepare('SELECT id, created_at FROM jobs WHERE published = 1').all();
  const staticUrls = ['', '/jobs', '/quiz', '/about', '/disclaimer'];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of staticUrls) {
    xml += `  <url><loc>${res.locals.siteUrl}${url}</loc><changefreq>daily</changefreq></url>\n`;
  }
  for (const job of jobs) {
    xml += `  <url><loc>${res.locals.siteUrl}/jobs/${job.id}</loc><lastmod>${job.created_at.split(' ')[0]}</lastmod></url>\n`;
  }
  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

module.exports = router;
