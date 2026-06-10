/*
   DB_POSTGRES.JS — PostgreSQL Data Store (Project 3)
   Handles real SQL CRUD operations using parameterized queries
   Tables: users, portfolios, skills, projects, experience, contact
 */

const { Pool } = require('pg');

// Initialize Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stitchfolio'
});

// Helper to convert database tables into the standard nested JSON envelope
function formatPortfolio(portfolioRow, skills, projects, experiences, contact) {
  return {
    id: 'portfolio_' + portfolioRow.id,
    basics: {
      fullName: portfolioRow.full_name,
      tagline: portfolioRow.tagline,
      bio: portfolioRow.bio,
      location: portfolioRow.location
    },
    skills: skills.map(s => ({ id: 'skill_' + s.id, name: s.name, level: s.level })),
    projects: projects.map(p => ({ id: 'proj_' + p.id, title: p.title, desc: p.description, url: p.url })),
    experience: experiences.map(e => {
      // Format DATE objects to YYYY-MM
      const startStr = e.start_date ? new Date(e.start_date).toISOString().slice(0, 7) : '';
      const endStr = e.end_date ? new Date(e.end_date).toISOString().slice(0, 7) : '';
      return { id: 'exp_' + e.id, role: e.role, company: e.company, start: startStr, end: endStr };
    }),
    contact: contact ? {
      email: contact.email,
      github: contact.github_url,
      linkedin: contact.linkedin_url
    } : null,
    createdAt: portfolioRow.created_at,
    updatedAt: portfolioRow.updated_at
  };
}

// CREATE — atomic transaction inserting to multiple tables
async function create(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create or reference the user
    const email = data.contact?.email || 'user@email.com';
    const username = email.split('@')[0];
    const userRes = await client.query(
      `INSERT INTO users (email, username) 
       VALUES ($1, $2) 
       ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email 
       RETURNING id`,
      [email, username]
    );
    const userId = userRes.rows[0].id;

    // 2. Insert main portfolio record
    const portRes = await client.query(
      `INSERT INTO portfolios (user_id, full_name, tagline, bio, location) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, data.basics.fullName, data.basics.tagline, data.basics.bio, data.basics.location]
    );
    const portfolio = portRes.rows[0];
    const portfolioId = portfolio.id;

    // 3. Insert skills
    const insertedSkills = [];
    if (data.skills && Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        const skillRes = await client.query(
          `INSERT INTO skills (portfolio_id, name, level) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [portfolioId, skill.name, skill.level]
        );
        insertedSkills.push(skillRes.rows[0]);
      }
    }

    // 4. Insert projects
    const insertedProjects = [];
    if (data.projects && Array.isArray(data.projects)) {
      for (const proj of data.projects) {
        const projRes = await client.query(
          `INSERT INTO projects (portfolio_id, title, description, url) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [portfolioId, proj.title, proj.desc, proj.url]
        );
        insertedProjects.push(projRes.rows[0]);
      }
    }

    // 5. Insert experience
    const insertedExps = [];
    if (data.experience && Array.isArray(data.experience)) {
      for (const exp of data.experience) {
        const startVal = exp.start ? exp.start + '-01' : null;
        const endVal = exp.end ? exp.end + '-01' : null;
        const expRes = await client.query(
          `INSERT INTO experience (portfolio_id, role, company, start_date, end_date) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [portfolioId, exp.role, exp.company, startVal, endVal]
        );
        insertedExps.push(expRes.rows[0]);
      }
    }

    // 6. Insert contact details
    let insertedContact = null;
    if (data.contact) {
      const contactRes = await client.query(
        `INSERT INTO contact (portfolio_id, email, github_url, linkedin_url) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [portfolioId, data.contact.email, data.contact.github, data.contact.linkedin]
      );
      insertedContact = contactRes.rows[0];
    }

    await client.query('COMMIT');
    return formatPortfolio(portfolio, insertedSkills, insertedProjects, insertedExps, insertedContact);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// READ — retrieve single portfolio using join details
async function read(id) {
  const numericId = parseInt(id.replace('portfolio_', ''), 10) || parseInt(id, 10);
  if (isNaN(numericId)) return null;

  const portRes = await pool.query('SELECT * FROM portfolios WHERE id = $1', [numericId]);
  if (portRes.rows.length === 0) return null;
  const portfolio = portRes.rows[0];

  const skillsRes = await pool.query('SELECT * FROM skills WHERE portfolio_id = $1', [numericId]);
  const projectsRes = await pool.query('SELECT * FROM projects WHERE portfolio_id = $1', [numericId]);
  const expsRes = await pool.query('SELECT * FROM experience WHERE portfolio_id = $1', [numericId]);
  const contactRes = await pool.query('SELECT * FROM contact WHERE portfolio_id = $1 LIMIT 1', [numericId]);

  return formatPortfolio(
    portfolio,
    skillsRes.rows,
    projectsRes.rows,
    expsRes.rows,
    contactRes.rows[0] || null
  );
}

// LIST — retrieve all portfolios
async function list() {
  const portRes = await pool.query('SELECT * FROM portfolios ORDER BY id DESC');
  const resultList = [];
  for (const row of portRes.rows) {
    const skillsRes = await pool.query('SELECT * FROM skills WHERE portfolio_id = $1', [row.id]);
    const projectsRes = await pool.query('SELECT * FROM projects WHERE portfolio_id = $1', [row.id]);
    const expsRes = await pool.query('SELECT * FROM experience WHERE portfolio_id = $1', [row.id]);
    const contactRes = await pool.query('SELECT * FROM contact WHERE portfolio_id = $1 LIMIT 1', [row.id]);
    resultList.push(formatPortfolio(row, skillsRes.rows, projectsRes.rows, expsRes.rows, contactRes.rows[0] || null));
  }
  return resultList;
}

// UPDATE — idempotent update
async function update(id, data) {
  const numericId = parseInt(id.replace('portfolio_', ''), 10) || parseInt(id, 10);
  if (isNaN(numericId)) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Confirm existence
    const checkRes = await client.query('SELECT id FROM portfolios WHERE id = $1', [numericId]);
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // 1. Update basics
    const portRes = await client.query(
      `UPDATE portfolios 
       SET full_name = $1, tagline = $2, bio = $3, location = $4, updated_at = NOW() 
       WHERE id = $5 
       RETURNING *`,
      [data.basics.fullName, data.basics.tagline, data.basics.bio, data.basics.location, numericId]
    );
    const portfolio = portRes.rows[0];

    // 2. Clear old relations (cascaded updates)
    await client.query('DELETE FROM skills WHERE portfolio_id = $1', [numericId]);
    await client.query('DELETE FROM projects WHERE portfolio_id = $1', [numericId]);
    await client.query('DELETE FROM experience WHERE portfolio_id = $1', [numericId]);
    await client.query('DELETE FROM contact WHERE portfolio_id = $1', [numericId]);

    // 3. Re-insert skills
    const insertedSkills = [];
    if (data.skills && Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        const skillRes = await client.query(
          `INSERT INTO skills (portfolio_id, name, level) VALUES ($1, $2, $3) RETURNING *`,
          [numericId, skill.name, skill.level]
        );
        insertedSkills.push(skillRes.rows[0]);
      }
    }

    // 4. Re-insert projects
    const insertedProjects = [];
    if (data.projects && Array.isArray(data.projects)) {
      for (const proj of data.projects) {
        const projRes = await client.query(
          `INSERT INTO projects (portfolio_id, title, description, url) VALUES ($1, $2, $3, $4) RETURNING *`,
          [numericId, proj.title, proj.desc, proj.url]
        );
        insertedProjects.push(projRes.rows[0]);
      }
    }

    // 5. Re-insert experience
    const insertedExps = [];
    if (data.experience && Array.isArray(data.experience)) {
      for (const exp of data.experience) {
        const startVal = exp.start ? exp.start + '-01' : null;
        const endVal = exp.end ? exp.end + '-01' : null;
        const expRes = await client.query(
          `INSERT INTO experience (portfolio_id, role, company, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [numericId, exp.role, exp.company, startVal, endVal]
        );
        insertedExps.push(expRes.rows[0]);
      }
    }

    // 6. Re-insert contact
    let insertedContact = null;
    if (data.contact) {
      const contactRes = await client.query(
        `INSERT INTO contact (portfolio_id, email, github_url, linkedin_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [numericId, data.contact.email, data.contact.github, data.contact.linkedin]
      );
      insertedContact = contactRes.rows[0];
    }

    await client.query('COMMIT');
    return formatPortfolio(portfolio, insertedSkills, insertedProjects, insertedExps, insertedContact);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// DELETE — delete portfolio record and cascade delete details
async function remove(id) {
  const numericId = parseInt(id.replace('portfolio_', ''), 10) || parseInt(id, 10);
  if (isNaN(numericId)) return false;

  const checkRes = await pool.query('SELECT id FROM portfolios WHERE id = $1', [numericId]);
  if (checkRes.rows.length === 0) return false;

  await pool.query('DELETE FROM portfolios WHERE id = $1', [numericId]);
  return true;
}

// COUNT — number of portfolios
async function count() {
  const res = await pool.query('SELECT COUNT(*) FROM portfolios');
  return parseInt(res.rows[0].count, 10);
}

module.exports = { create, read, list, update, remove, count };
