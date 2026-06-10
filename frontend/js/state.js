/* =============================================
   STATE.JS — Basic State Management (Project 1)
   Central data store for the portfolio builder
   ============================================= */

const State = (() => {

  // --- Initial state shape ---
  const _defaultState = {
    basics: {
      fullName: '',
      tagline: '',
      bio: '',
      location: ''
    },
    skills: [],      // [{ id, name, level }]
    projects: [],    // [{ id, title, desc, url }]
    experience: [],  // [{ id, role, company, start, end }]
    contact: {
      email: '',
      github: '',
      linkedin: ''
    }
  };

  // Deep copy for initial state
  let _state = JSON.parse(JSON.stringify(_defaultState));

  // --- Subscribers (observer pattern) ---
  const _listeners = [];

  function _notify() {
    _listeners.forEach(fn => fn(getState()));
  }

  // --- Public API ---
  function getState() {
    return JSON.parse(JSON.stringify(_state));
  }

  function subscribe(fn) {
    _listeners.push(fn);
    return () => {
      const idx = _listeners.indexOf(fn);
      if (idx > -1) _listeners.splice(idx, 1);
    };
  }

  function updateBasics(field, value) {
    _state.basics[field] = value;
    _notify();
  }

  function addSkill(name, level) {
    const id = 'skill_' + Date.now();
    _state.skills.push({ id, name: name.trim(), level });
    _notify();
    return id;
  }

  function removeSkill(id) {
    _state.skills = _state.skills.filter(s => s.id !== id);
    _notify();
  }

  function addProject(title, desc, url) {
    const id = 'proj_' + Date.now();
    _state.projects.push({ id, title: title.trim(), desc: desc.trim(), url: url.trim() });
    _notify();
    return id;
  }

  function removeProject(id) {
    _state.projects = _state.projects.filter(p => p.id !== id);
    _notify();
  }

  function addExperience(role, company, start, end) {
    const id = 'exp_' + Date.now();
    _state.experience.push({ id, role: role.trim(), company: company.trim(), start, end });
    _notify();
    return id;
  }

  function removeExperience(id) {
    _state.experience = _state.experience.filter(e => e.id !== id);
    _notify();
  }

  function updateContact(field, value) {
    _state.contact[field] = value;
    _notify();
  }

  function reset() {
    _state = JSON.parse(JSON.stringify(_defaultState));
    _notify();
  }

  function hasMinimumData() {
    return _state.basics.fullName.trim().length > 0 &&
           _state.basics.bio.trim().length > 0 &&
           _state.contact.email.trim().length > 0;
  }

  return {
    getState,
    subscribe,
    updateBasics,
    addSkill,
    removeSkill,
    addProject,
    removeProject,
    addExperience,
    removeExperience,
    updateContact,
    reset,
    hasMinimumData
  };

})();
