/*
   SERVER.JS — Express Backend (Project 2)
   RESTful API: POST / GET / PUT / DELETE
   Port: 3000
*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('../database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(bodyParser.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Serve frontend statically
app.use(express.static(path.join(__dirname, '../frontend')));

// ---- Standard response envelope ----
function respond(res, success, data, message, statusCode) {
  return res.status(statusCode).json({ success, data, message, statusCode });
}

// ---- Validation helper (mirrors api.js client-side rules) ----
function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Invalid payload format.');
    return errors;
  }

  if (!payload.basics || typeof payload.basics !== 'object') {
    errors.push('Missing required field: basics.');
  } else {
    if (!payload.basics.fullName || payload.basics.fullName.trim().length < 2)
      errors.push('basics.fullName must be at least 2 characters.');
    if (!payload.basics.bio || payload.basics.bio.trim().length < 10)
      errors.push('basics.bio must be at least 10 characters.');
  }

  if (!payload.contact || typeof payload.contact !== 'object') {
    errors.push('Missing required field: contact.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.contact.email || !emailRegex.test(payload.contact.email.trim()))
      errors.push('contact.email must be a valid email address.');
  }

  if (payload.skills && Array.isArray(payload.skills)) {
    const validLevels = ['beginner', 'intermediate', 'expert'];
    payload.skills.forEach((s, i) => {
      if (!validLevels.includes(s.level))
        errors.push(`skills[${i}].level must be one of: beginner, intermediate, expert.`);
    });
  }

  return errors;
}

// POST /portfolios — Create
app.post('/portfolios', async (req, res) => {
  const errors = validatePayload(req.body);
  if (errors.length > 0)
    return respond(res, false, null, errors.join(' '), 400);

  try {
    const record = await db.create(req.body);
    return respond(res, true, { id: record.id, portfolio: record }, 'Portfolio created successfully.', 201);
  } catch (err) {
    console.error(err);
    return respond(res, false, null, 'Internal server error.', 500);
  }
});

// GET /portfolios — List all
app.get('/portfolios', async (req, res) => {
  try {
    const all = await db.list();
    return respond(res, true, { portfolios: all, count: all.length }, 'Portfolios retrieved.', 200);
  } catch (err) {
    console.error(err);
    return respond(res, false, null, 'Internal server error.', 500);
  }
});

// GET /portfolios/:id — Read one
app.get('/portfolios/:id', async (req, res) => {
  try {
    const record = await db.read(req.params.id);
    if (!record)
      return respond(res, false, null, `Portfolio with ID "${req.params.id}" not found.`, 404);
    return respond(res, true, { portfolio: record }, 'Portfolio retrieved successfully.', 200);
  } catch (err) {
    console.error(err);
    return respond(res, false, null, 'Internal server error.', 500);
  }
});

// PUT /portfolios/:id — Update (idempotent)
app.put('/portfolios/:id', async (req, res) => {
  try {
    const existing = await db.read(req.params.id);
    if (!existing)
      return respond(res, false, null, `Portfolio with ID "${req.params.id}" not found.`, 404);

    const errors = validatePayload(req.body);
    if (errors.length > 0)
      return respond(res, false, null, errors.join(' '), 400);

    const updated = await db.update(req.params.id, req.body);
    return respond(res, true, { portfolio: updated }, 'Portfolio updated successfully.', 200);
  } catch (err) {
    console.error(err);
    return respond(res, false, null, 'Internal server error.', 500);
  }
});

// DELETE /portfolios/:id — Delete
app.delete('/portfolios/:id', async (req, res) => {
  try {
    const existing = await db.read(req.params.id);
    if (!existing)
      return respond(res, false, null, `Portfolio with ID "${req.params.id}" not found.`, 404);

    await db.remove(req.params.id);
    return respond(res, true, null, 'Portfolio deleted successfully.', 204);
  } catch (err) {
    console.error(err);
    return respond(res, false, null, 'Internal server error.', 500);
  }
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`stitchfolio API running at http://localhost:${PORT}`);
});

module.exports = app;
