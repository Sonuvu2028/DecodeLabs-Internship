/*
   DB_INMEMORY.JS — In-Memory Data Store (Project 3 fallback)
   Simulates SQL CRUD operations
   Tables: portfolios, skills, projects,
           experience, contact
 */

const _store   = {};   // { [id]: portfolioRecord }
let   _counter = 1;

function create(data) {
  const id = 'portfolio_' + (_counter++);
  const now = new Date().toISOString();

  const record = {
    id,
    basics:     { ...data.basics },
    skills:     (data.skills     || []).map(s => ({ ...s })),
    projects:   (data.projects   || []).map(p => ({ ...p })),
    experience: (data.experience || []).map(e => ({ ...e })),
    contact:    { ...data.contact },
    createdAt:  now,
    updatedAt:  now,
  };

  _store[id] = record;
  return record;
}

function read(id) {
  const record = _store[id];
  if (!record) return null;
  return JSON.parse(JSON.stringify(record));
}

function list() {
  return Object.values(_store).map(r => JSON.parse(JSON.stringify(r)));
}

function update(id, data) {
  if (!_store[id]) return null;

  _store[id] = {
    ..._store[id],
    basics:     { ...data.basics },
    skills:     (data.skills     || []).map(s => ({ ...s })),
    projects:   (data.projects   || []).map(p => ({ ...p })),
    experience: (data.experience || []).map(e => ({ ...e })),
    contact:    { ...data.contact },
    updatedAt:  new Date().toISOString(),
  };

  return JSON.parse(JSON.stringify(_store[id]));
}

function remove(id) {
  if (!_store[id]) return false;
  delete _store[id];
  return true;
}

function count() {
  return Object.keys(_store).length;
}

function seed() {
  create({
    basics: {
      fullName: 'Aarav Sharma',
      tagline:  'Full Stack Developer · DecodeLabs 2026',
      bio:      'A passionate developer who loves building things for the web.',
      location: 'Lucknow, India',
    },
    skills: [
      { id: 'skill_1', name: 'JavaScript', level: 'intermediate' },
      { id: 'skill_2', name: 'HTML5',      level: 'expert'       },
      { id: 'skill_3', name: 'CSS3',       level: 'expert'       },
    ],
    projects: [
      {
        id:    'proj_1',
        title: 'Portfolio Maker',
        desc:  'A full-stack portfolio builder app.',
        url:   'https://github.com/username/portfolio-maker',
      },
    ],
    experience: [
      {
        id:      'exp_1',
        role:    'Full Stack Intern',
        company: 'DecodeLabs',
        start:   '2026-01',
        end:     '',
      },
    ],
    contact: {
      email:    'aarav@email.com',
      github:   'https://github.com/aarav',
      linkedin: 'https://linkedin.com/in/aarav',
    },
  });
}

module.exports = { create, read, list, update, remove, count, seed };
