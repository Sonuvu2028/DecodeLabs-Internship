/*
   API.JS — Backend API Integration (Project 2)
   RESTful endpoints: GET / POST / PUT / DELETE
   Handles user input, responses, validation
   Status codes: 200, 201, 400, 404, 500
   JSON request/response format
 */

const API = (() => {

  // --- In-memory data store (simulates DB — Project 3) ---
  const _store = {};
  let _idCounter = 1;

  // Check if we are running in a browser environment served over HTTP
  const USE_LIVE_API = window.location.protocol.startsWith('http');
  const BASE_URL = ''; // Relative path since frontend is statically served by the server

  // --- Simulate network latency ---
  function _delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Standard response envelope ---
  function _response(success, data, message, statusCode) {
    return { success, data, message, statusCode };
  }

  // --- Syntactic Validation (Gatekeeper — "Never Trust the Client") ---
  function _validatePortfolioPayload(payload) {
    const errors = [];

    // Layer 1: Syntactic — is the format correct?
    if (!payload || typeof payload !== 'object') {
      errors.push('Invalid payload format.');
      return errors;
    }

    if (!payload.basics || typeof payload.basics !== 'object') {
      errors.push('Missing required field: basics.');
    } else {
      if (!payload.basics.fullName || payload.basics.fullName.trim().length < 2) {
        errors.push('basics.fullName must be at least 2 characters.');
      }
      if (!payload.basics.bio || payload.basics.bio.trim().length < 10) {
        errors.push('basics.bio must be at least 10 characters.');
      }
    }

    if (!payload.contact || typeof payload.contact !== 'object') {
      errors.push('Missing required field: contact.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!payload.contact.email || !emailRegex.test(payload.contact.email.trim())) {
        errors.push('contact.email must be a valid email address.');
      }
    }

    // Layer 2: Semantic — is the logic valid?
    if (payload.skills && Array.isArray(payload.skills)) {
      const validLevels = ['beginner', 'intermediate', 'expert'];
      payload.skills.forEach((s, i) => {
        if (!validLevels.includes(s.level)) {
          errors.push(`skills[${i}].level must be one of: beginner, intermediate, expert.`);
        }
      });
    }

    return errors;
  }

  // =============================================
  // POST /portfolios — Create
  // =============================================
  async function createPortfolio(portfolioData) {
    _updateStatus('loading', 'Saving portfolio...');
    await _delay(500);

    if (USE_LIVE_API) {
      try {
        const response = await fetch(`${BASE_URL}/portfolios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(portfolioData)
        });
        const resData = await response.json();
        if (response.ok) {
          _updateStatus('success', `Portfolio saved (ID: ${resData.data.id})`);
          return resData;
        } else {
          _updateStatus('error', resData.message || 'Validation failed.');
          return resData;
        }
      } catch (err) {
        _updateStatus('error', 'Server error.');
        return _response(false, null, 'Internal server error.', 500);
      }
    }

    // Fallback Simulated Mode
    try {
      const errors = _validatePortfolioPayload(portfolioData);
      if (errors.length > 0) {
        _updateStatus('error', 'Validation failed.');
        return _response(false, null, errors.join(' '), 400);
      }

      const id = 'portfolio_' + (_idCounter++);
      const record = {
        id,
        ...portfolioData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      _store[id] = record;

      _updateStatus('success', 'Portfolio saved (ID: ' + id + ')');
      return _response(true, { id, portfolio: record }, 'Portfolio created successfully.', 201);
    } catch (err) {
      _updateStatus('error', 'Server error.');
      return _response(false, null, 'Internal server error.', 500);
    }
  }

  // =============================================
  // GET /portfolios/:id — Read One
  // =============================================
  async function getPortfolio(id) {
    _updateStatus('loading', 'Fetching portfolio...');
    await _delay(300);

    if (USE_LIVE_API) {
      try {
        const response = await fetch(`${BASE_URL}/portfolios/${id}`);
        const resData = await response.json();
        if (response.ok) {
          _updateStatus('success', 'Portfolio loaded.');
          return resData;
        } else {
          _updateStatus('error', resData.message || '404 — Not found.');
          return resData;
        }
      } catch (err) {
        _updateStatus('error', 'Server error.');
        return _response(false, null, 'Internal server error.', 500);
      }
    }

    // Fallback Simulated Mode
    try {
      const record = _store[id];
      if (!record) {
        _updateStatus('error', '404 — Not found.');
        return _response(false, null, `Portfolio with ID "${id}" not found.`, 404);
      }
      _updateStatus('success', 'Portfolio loaded.');
      return _response(true, { portfolio: record }, 'Portfolio retrieved successfully.', 200);
    } catch (err) {
      _updateStatus('error', 'Server error.');
      return _response(false, null, 'Internal server error.', 500);
    }
  }

  // =============================================
  // PUT /portfolios/:id — Update
  // =============================================
  async function updatePortfolio(id, portfolioData) {
    _updateStatus('loading', 'Updating portfolio...');
    await _delay(400);

    if (USE_LIVE_API) {
      try {
        const response = await fetch(`${BASE_URL}/portfolios/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(portfolioData)
        });
        const resData = await response.json();
        if (response.ok) {
          _updateStatus('success', 'Portfolio updated.');
          return resData;
        } else {
          _updateStatus('error', resData.message || 'Validation failed.');
          return resData;
        }
      } catch (err) {
        _updateStatus('error', 'Server error.');
        return _response(false, null, 'Internal server error.', 500);
      }
    }

    // Fallback Simulated Mode
    try {
      if (!_store[id]) {
        _updateStatus('error', '404 — Not found.');
        return _response(false, null, `Portfolio with ID "${id}" not found.`, 404);
      }

      const errors = _validatePortfolioPayload(portfolioData);
      if (errors.length > 0) {
        _updateStatus('error', 'Validation failed.');
        return _response(false, null, errors.join(' '), 400);
      }

      _store[id] = {
        ..._store[id],
        ...portfolioData,
        updatedAt: new Date().toISOString()
      };

      _updateStatus('success', 'Portfolio updated.');
      return _response(true, { portfolio: _store[id] }, 'Portfolio updated successfully.', 200);
    } catch (err) {
      _updateStatus('error', 'Server error.');
      return _response(false, null, 'Internal server error.', 500);
    }
  }

  // =============================================
  // DELETE /portfolios/:id — Delete
  // =============================================
  async function deletePortfolio(id) {
    _updateStatus('loading', 'Deleting portfolio...');
    await _delay(300);

    if (USE_LIVE_API) {
      try {
        const response = await fetch(`${BASE_URL}/portfolios/${id}`, {
          method: 'DELETE'
        });
        if (response.status === 204) {
          _updateStatus('success', 'Portfolio deleted.');
          return _response(true, null, 'Portfolio deleted successfully.', 204);
        }
        const resData = await response.json();
        _updateStatus('error', resData.message || 'Error deleting.');
        return resData;
      } catch (err) {
        _updateStatus('error', 'Server error.');
        return _response(false, null, 'Internal server error.', 500);
      }
    }

    // Fallback Simulated Mode
    try {
      if (!_store[id]) {
        _updateStatus('error', '404 — Not found.');
        return _response(false, null, `Portfolio with ID "${id}" not found.`, 404);
      }

      delete _store[id];
      _updateStatus('success', 'Portfolio deleted.');
      return _response(true, null, 'Portfolio deleted successfully.', 204);
    } catch (err) {
      _updateStatus('error', 'Server error.');
      return _response(false, null, 'Internal server error.', 500);
    }
  }

  // =============================================
  // GET /portfolios — List All
  // =============================================
  async function listPortfolios() {
    await _delay(200);

    if (USE_LIVE_API) {
      try {
        const response = await fetch(`${BASE_URL}/portfolios`);
        const resData = await response.json();
        return resData;
      } catch (err) {
        return _response(false, null, 'Internal server error.', 500);
      }
    }

    // Fallback Simulated Mode
    const all = Object.values(_store);
    return _response(true, { portfolios: all, count: all.length }, 'Portfolios retrieved.', 200);
  }

  // --- Status indicator update ---
  let _statusEl = null;

  function _updateStatus(type, message) {
    if (!_statusEl) {
      _statusEl = document.getElementById('apiStatus');
    }
    if (!_statusEl) return;

    const dot = _statusEl.querySelector('.api-dot');
    const text = _statusEl.querySelector('.api-text');
    if (dot) {
      dot.className = 'api-dot';
      dot.classList.add(type);
    }
    if (text) text.textContent = message;
  }

  function injectStatusBar(container) {
    const el = document.createElement('div');
    el.className = 'api-status';
    el.id = 'apiStatus';
    el.setAttribute('aria-live', 'polite');
    const statusText = USE_LIVE_API 
      ? 'Connected to stitchfolio REST API (Port 3000).' 
      : 'Running in simulated network mode (Local browser memory).';
    el.innerHTML = `
      <span class="api-dot success"></span>
      <span class="api-text">${statusText}</span>`;
    container.appendChild(el);
    _statusEl = el;
  }

  return {
    createPortfolio,
    getPortfolio,
    updatePortfolio,
    deletePortfolio,
    listPortfolios,
    injectStatusBar
  };

})();
