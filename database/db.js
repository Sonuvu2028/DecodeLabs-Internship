/*
   DB.JS — Dual Database Connector (In-Memory / PostgreSQL)
   Project 3: Database Integration
   Automatically switches between PostgreSQL and in-memory simulation.
 */

const { Pool } = require('pg');
const inMemoryDb = require('./db_inmemory');
const postgresDb = require('./db_postgres');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stitchfolio';

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 2000
});

let activeDb = inMemoryDb;
let isInitialized = false;
let initPromise = null;

async function init() {
  if (isInitialized) return;
  try {
    // Try a simple query to see if Postgres is up
    await pool.query('SELECT 1');
    console.log('🟢 Connected to PostgreSQL database successfully. Using pg driver.');
    activeDb = postgresDb;
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection failed. Falling back to in-memory simulation. Error:', err.message);
    activeDb = inMemoryDb;
  }
  isInitialized = true;
}

// Start initialization immediately in the background
initPromise = init();

module.exports = {
  create: async (data) => {
    await initPromise;
    return activeDb.create(data);
  },
  read: async (id) => {
    await initPromise;
    return activeDb.read(id);
  },
  list: async () => {
    await initPromise;
    return activeDb.list();
  },
  update: async (id, data) => {
    await initPromise;
    return activeDb.update(id, data);
  },
  remove: async (id) => {
    await initPromise;
    return activeDb.remove(id);
  },
  count: async () => {
    await initPromise;
    return activeDb.count();
  },
  seed: async () => {
    await initPromise;
    if (activeDb.seed) {
      return activeDb.seed();
    }
  }
};
