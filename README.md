# stitchfolio — API Documentation
🚀 **Live Demo:** [Click here to view the live site](https://stitchfolio.onrender.com/#builder)


> DecodeLabs Full Stack Development · Industrial Training Kit · Batch 2026

---

## Overview

stitchfolio is a full-stack Portfolio Maker application satisfying all three
DecodeLabs project milestones:

| Project | Focus | Status |
|---------|-------|--------|
| Project 1 | Responsive Frontend Interface (HTML, CSS, JS) | ✅ Complete |
| Project 2 | Backend API Development (GET/POST, validation, status codes) | ✅ Complete |
| Project 3 | Database Integration (Schema, CRUD, constraints) | ✅ Complete |

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Layout**: CSS Grid (macro) + Flexbox (micro) + Mobile-First
- **Fonts**: Montserrat (headlines) · Open Sans (body)
- **Colors**: Mocha Mousse #A5856E · Ethereal Blue #A0D4E0 · Moonlit Grey #F2F0EA
- **API Layer**: Simulated RESTful API (api.js) with in-memory store
- **Database Layer**: In-memory data store simulating CRUD operations

---

## API Endpoints

All requests and responses use **JSON** format.
All responses follow a standard envelope:

```json
{
  "success": true | false,
  "data": { ... } | null,
  "message": "Human-readable message",
  "statusCode": 200 | 201 | 204 | 400 | 404 | 500
}
```

---

### POST /portfolios

Create a new portfolio.

**Method**: POST  
**Resource**: `/portfolios`  
**Idempotent**: No (POST is non-idempotent — identical requests create multiple records)

**Request Body**:
```json
{
  "basics": {
    "fullName": "Aarav Sharma",
    "tagline": "Full Stack Developer · DecodeLabs 2026",
    "bio": "A passionate developer who loves building things for the web.",
    "location": "Lucknow, India"
  },
  "skills": [
    { "id": "skill_1", "name": "JavaScript", "level": "intermediate" },
    { "id": "skill_2", "name": "HTML5", "level": "expert" }
  ],
  "projects": [
    {
      "id": "proj_1",
      "title": "Portfolio Maker",
      "desc": "A full-stack portfolio builder app.",
      "url": "https://github.com/username/portfolio-maker"
    }
  ],
  "experience": [
    {
      "id": "exp_1",
      "role": "Full Stack Intern",
      "company": "DecodeLabs",
      "start": "2026-01",
      "end": ""
    }
  ],
  "contact": {
    "email": "aarav@email.com",
    "github": "https://github.com/aarav",
    "linkedin": "https://linkedin.com/in/aarav"
  }
}
```

**Success Response** — `201 Created`:
```json
{
  "success": true,
  "data": {
    "id": "portfolio_1",
    "portfolio": { ...full portfolio object... }
  },
  "message": "Portfolio created successfully.",
  "statusCode": 201
}
```

**Error Response** — `400 Bad Request`:
```json
{
  "success": false,
  "data": null,
  "message": "basics.fullName must be at least 2 characters. contact.email must be a valid email address.",
  "statusCode": 400
}
```

---

### GET /portfolios/:id

Retrieve a portfolio by its ID.

**Method**: GET  
**Resource**: `/portfolios/:id`  
**Safe**: Yes (GET does not modify data)  
**Idempotent**: Yes

**Request**: No body required.

**Success Response** — `200 OK`:
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "id": "portfolio_1",
      "basics": { ... },
      "skills": [ ... ],
      "projects": [ ... ],
      "experience": [ ... ],
      "contact": { ... },
      "createdAt": "2026-06-09T10:30:00.000Z",
      "updatedAt": "2026-06-09T10:30:00.000Z"
    }
  },
  "message": "Portfolio retrieved successfully.",
  "statusCode": 200
}
```

**Error Response** — `404 Not Found`:
```json
{
  "success": false,
  "data": null,
  "message": "Portfolio with ID \"portfolio_99\" not found.",
  "statusCode": 404
}
```

---

### PUT /portfolios/:id

Update an existing portfolio (full replacement — idempotent).

**Method**: PUT  
**Resource**: `/portfolios/:id`  
**Idempotent**: Yes (multiple identical PUT requests produce same result)

**Request Body**: Same structure as POST /portfolios

**Success Response** — `200 OK`:
```json
{
  "success": true,
  "data": {
    "portfolio": { ...updated portfolio... }
  },
  "message": "Portfolio updated successfully.",
  "statusCode": 200
}
```

**Error Responses**:
- `400 Bad Request` — validation failed
- `404 Not Found` — ID does not exist

---

### DELETE /portfolios/:id

Remove a portfolio permanently.

**Method**: DELETE  
**Resource**: `/portfolios/:id`

**Request**: No body required.

**Success Response** — `204 No Content`:
```json
{
  "success": true,
  "data": null,
  "message": "Portfolio deleted successfully.",
  "statusCode": 204
}
```

**Error Response** — `404 Not Found`:
```json
{
  "success": false,
  "data": null,
  "message": "Portfolio with ID \"portfolio_99\" not found.",
  "statusCode": 404
}
```

---

### GET /portfolios

List all portfolios.

**Method**: GET  
**Resource**: `/portfolios`

**Success Response** — `200 OK`:
```json
{
  "success": true,
  "data": {
    "portfolios": [ ...array of portfolio objects... ],
    "count": 3
  },
  "message": "Portfolios retrieved.",
  "statusCode": 200
}
```

---

## HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200  | OK | Successful GET, PUT |
| 201  | Created | Successful POST — new portfolio created |
| 204  | No Content | Successful DELETE |
| 400  | Bad Request | Validation failed (syntactic or semantic) |
| 404  | Not Found | Portfolio ID does not exist |
| 500  | Internal Server Error | Unexpected server crash |

---

## RESTful Naming Rules

Resources are **NOUNS**. Methods are **VERBS**.

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| GET /portfolios | GET /getPortfolios |
| POST /portfolios | POST /createPortfolio |
| PUT /portfolios/:id | POST /updatePortfolio |
| DELETE /portfolios/:id | GET /deletePortfolio |

---

## Validation — The Gatekeeper Rule

**"Never Trust the Client."**

Every POST and PUT request goes through two validation layers:

### Layer 1 — Syntactic Validation
*Is the format correct?*
- `basics.fullName` — must be non-empty string, min 2 characters
- `basics.bio` — must be non-empty string, min 10 characters  
- `contact.email` — must match valid email format (regex)
- `skills[].level` — must be one of: `beginner`, `intermediate`, `expert`

### Layer 2 — Semantic Validation
*Is the logic valid?*
- Skill level must be a valid enum value (CHECK constraint equivalent)
- Duplicate skills are rejected before adding to state

---

## Database Schema (Project 3)

### Tables & Relationships

```
users (1) ──────────── (Many) portfolios
portfolios (1) ──────── (Many) skills
portfolios (1) ──────── (Many) projects
portfolios (1) ──────── (Many) experiences
```

### Schema Definition

```sql
-- Users table
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  username   VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  full_name  VARCHAR(255) NOT NULL,
  tagline    TEXT,
  bio        TEXT NOT NULL,
  location   VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE skills (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  level        VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert'))
);

-- Projects table
CREATE TABLE projects (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  url          TEXT
);

-- Experience table
CREATE TABLE experience (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  role         VARCHAR(255) NOT NULL,
  company      VARCHAR(255) NOT NULL,
  start_date   DATE,
  end_date     DATE
);

-- Contact table
CREATE TABLE contact (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  email        VARCHAR(255) NOT NULL,
  github_url   TEXT,
  linkedin_url TEXT
);
```

### Constraints Applied
- `UNIQUE` — prevents duplicate emails and usernames
- `NOT NULL` — critical fields always required
- `CHECK` — skill level must be valid enum value
- `FOREIGN KEY` — referential integrity between tables

### CRUD → HTTP → SQL Mapping

| CRUD   | HTTP Method | SQL Statement |
|--------|-------------|---------------|
| Create | POST        | INSERT INTO   |
| Read   | GET         | SELECT        |
| Update | PUT / PATCH | UPDATE        |
| Delete | DELETE      | DELETE FROM   |

### Security — Parameterized Queries

```sql
-- VULNERABLE (never do this):
query = "SELECT * FROM portfolios WHERE id = " + userInput;

-- SECURE (always do this):
query = "SELECT * FROM portfolios WHERE id = $1";
db.execute(query, [userInput]);
```

Input is always treated as **data**, never as executable logic.

---

## Project Structure

```
/portfolio-maker
├── index.html              # Main HTML — semantic landmarks
├── css/
│   ├── variables.css       # Design tokens, color palette, typography
│   ├── layout.css          # CSS Grid macro layouts, breakpoints
│   └── components.css      # Flexbox micro components, UI elements
├── js/
│   ├── state.js            # State management (observer pattern)
│   ├── validation.js       # Syntactic & semantic validation
│   ├── preview.js          # Real-time live preview rendering
│   ├── api.js              # RESTful API layer (GET/POST/PUT/DELETE)
│   └── app.js              # Main app — wires everything together
└── README.md               # This file — API documentation
```

---

## Execution Roadmap (from Project 1 PDFs)

| Step | Phase | What Was Done |
|------|-------|---------------|
| 1 | Discovery | Defined "How Might We build a portfolio maker" |
| 2 | Wireframe | Designed grayscale mobile-first layout |
| 3 | Semantics | Built HTML5 with header, nav, main, article, footer |
| 4 | Style | Applied CSS Grid/Flex + 2025 DecodeLabs palette |
| 5 | Logic | Added JS state, validation, live preview, API calls |
| 6 | Audit | WCAG accessibility, aria labels, focus management |

---

*DecodeLabs Industrial Training Kit · Batch 2026 · Powered by DecodeLabs*
