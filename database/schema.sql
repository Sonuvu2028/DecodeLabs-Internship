-- =============================================
-- SCHEMA.SQL — stitchfolio Database Schema
-- Project 3: Database Integration
-- DecodeLabs Industrial Training Kit · 2026
-- =============================================
-- Run this file against any PostgreSQL database to
-- create the full schema:
--   psql -U <user> -d stitchfolio -f schema.sql
-- =============================================

-- Drop tables in reverse-dependency order (safe re-run)
DROP TABLE IF EXISTS contact    CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS projects   CASCADE;
DROP TABLE IF EXISTS skills     CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS users      CASCADE;

-- =============================================
-- USERS — one user can own many portfolios
-- =============================================
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  username   VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PORTFOLIOS — core record; belongs to one user
-- =============================================
CREATE TABLE portfolios (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name  VARCHAR(255) NOT NULL,
  tagline    TEXT,
  bio        TEXT        NOT NULL,
  location   VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Keep updated_at current automatically (PostgreSQL)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================
-- SKILLS — many skills per portfolio
-- CHECK constraint enforces valid enum values
-- =============================================
CREATE TABLE skills (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  level        VARCHAR(20)  NOT NULL
    CHECK (level IN ('beginner', 'intermediate', 'expert'))
);

-- =============================================
-- PROJECTS — many projects per portfolio
-- =============================================
CREATE TABLE projects (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  url          TEXT
);

-- =============================================
-- EXPERIENCE — many entries per portfolio
-- =============================================
CREATE TABLE experience (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  role         VARCHAR(255) NOT NULL,
  company      VARCHAR(255) NOT NULL,
  start_date   DATE,
  end_date     DATE          -- NULL means "Present"
);

-- =============================================
-- CONTACT — one contact block per portfolio
-- =============================================
CREATE TABLE contact (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  email        VARCHAR(255) NOT NULL,
  github_url   TEXT,
  linkedin_url TEXT
);

-- =============================================
-- SAMPLE DATA — mirrors the seed in db.js
-- =============================================
INSERT INTO users (email, username) VALUES
  ('aarav@email.com', 'aarav');

INSERT INTO portfolios (user_id, full_name, tagline, bio, location) VALUES
  (1, 'Aarav Sharma', 'Full Stack Developer · DecodeLabs 2026',
   'A passionate developer who loves building things for the web.',
   'Lucknow, India');

INSERT INTO skills (portfolio_id, name, level) VALUES
  (1, 'JavaScript', 'intermediate'),
  (1, 'HTML5',      'expert'),
  (1, 'CSS3',       'expert');

INSERT INTO projects (portfolio_id, title, description, url) VALUES
  (1, 'Portfolio Maker', 'A full-stack portfolio builder app.',
   'https://github.com/username/portfolio-maker');

INSERT INTO experience (portfolio_id, role, company, start_date, end_date) VALUES
  (1, 'Full Stack Intern', 'DecodeLabs', '2026-01-01', NULL);

INSERT INTO contact (portfolio_id, email, github_url, linkedin_url) VALUES
  (1, 'aarav@email.com',
   'https://github.com/aarav',
   'https://linkedin.com/in/aarav');

-- =============================================
-- USEFUL QUERIES (for reference)
-- =============================================

-- Fetch full portfolio with all related data:
-- SELECT p.*, s.name AS skill_name, s.level,
--        pr.title, pr.description, pr.url,
--        e.role, e.company, e.start_date, e.end_date,
--        c.email, c.github_url, c.linkedin_url
-- FROM portfolios p
-- LEFT JOIN skills     s  ON s.portfolio_id  = p.id
-- LEFT JOIN projects   pr ON pr.portfolio_id = p.id
-- LEFT JOIN experience e  ON e.portfolio_id  = p.id
-- LEFT JOIN contact    c  ON c.portfolio_id  = p.id
-- WHERE p.id = $1;

-- Parameterized — safe from SQL injection:
-- SELECT * FROM portfolios WHERE id = $1;
-- INSERT INTO skills (portfolio_id, name, level) VALUES ($1, $2, $3);
