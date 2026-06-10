# stitchfolio — Project Structure

> DecodeLabs Full Stack Development · Industrial Training Kit · Batch 2026

---

## Folder Structure

```
stitchfolio/
├── frontend/                  ← Project 1: Responsive UI
│   ├── index.html             — Semantic HTML5, accessibility
│   ├── css/
│   │   ├── variables.css      — Design tokens, color palette
│   │   ├── layout.css         — CSS Grid macro layouts
│   │   └── components.css     — Flexbox micro components
│   └── js/
│       ├── state.js           — Observer-pattern state store
│       ├── validation.js      — Syntactic & semantic validation
│       ├── preview.js         — Real-time live preview
│       ├── api.js             — Simulated in-browser API layer
│       └── app.js             — Main app — wires everything together
│
├── backend/                   ← Project 2: RESTful API
│   └── server.js              — Express server, all endpoints
│
├── database/                  ← Project 3: Database Integration
│   ├── db.js                  — In-memory CRUD store (Node module)
│   └── schema.sql             — PostgreSQL schema + sample data
│
├── package.json               — npm config for backend
└── README.md                  — API documentation (original)
```

---

## How to Run

### Option A — Frontend only (no server needed)

Just open `frontend/index.html` in your browser. The app uses `api.js`
which simulates the backend entirely in memory in the browser tab.

### Option B — Full stack (frontend + Express backend)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   # or for live-reload during development:
   npm run dev
   ```

3. The API will be available at `http://localhost:3000`

4. Open `frontend/index.html` in your browser (or configure the frontend
   to point `api.js` calls to `http://localhost:3000`).

### Option C — Connect to PostgreSQL (Project 3)

1. Create a database:
   ```bash
   createdb stitchfolio
   ```

2. Run the schema:
   ```bash
   psql -U <your-user> -d stitchfolio -f database/schema.sql
   ```

3. Update `database/db.js` to use `pg` (node-postgres) instead of the
   in-memory store — swap the `_store` object for parameterized queries
   matching the schema.

---

## API Endpoints (Quick Reference)

| Method | Endpoint           | Description          | Status Codes     |
|--------|--------------------|----------------------|------------------|
| POST   | /portfolios        | Create new portfolio | 201, 400, 500    |
| GET    | /portfolios        | List all portfolios  | 200              |
| GET    | /portfolios/:id    | Get one by ID        | 200, 404, 500    |
| PUT    | /portfolios/:id    | Update (full replace)| 200, 400, 404    |
| DELETE | /portfolios/:id    | Remove permanently   | 204, 404         |

See `README.md` for full request/response shapes and schema docs.

---

*DecodeLabs Industrial Training Kit · Batch 2026*
