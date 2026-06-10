/* =============================================
   PREVIEW.JS — Real-time Live Preview (Project 1)
   Updates preview panel as user types — pure JS
   DOM manipulation, no frameworks
   ============================================= */

const Preview = (() => {

  const previewBody = document.getElementById('previewBody');

  function _levelTag(level) {
    return `<span class="tag tag-${level}">${level}</span>`;
  }

  function _formatDate(monthStr) {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  }

  function _buildPreviewHTML(state) {
    const { basics, skills, projects, experience, contact } = state;

    // If nothing filled yet — show placeholder
    if (!basics.fullName && !basics.bio) {
      return `
        <div class="preview-placeholder">
          <div class="preview-icon" aria-hidden="true">◎</div>
          <p>Your portfolio preview will appear here as you type.</p>
        </div>`;
    }

    let html = '<div class="fade-in">';

    // --- Name & tagline ---
    if (basics.fullName) {
      html += `<p class="pv-name">${_escape(basics.fullName)}</p>`;
    }
    if (basics.tagline) {
      html += `<p class="pv-tagline">${_escape(basics.tagline)}</p>`;
    }
    if (basics.location) {
      html += `<p class="pv-location">📍 ${_escape(basics.location)}</p>`;
    }

    // --- Bio ---
    if (basics.bio) {
      html += '<div class="pv-divider"></div>';
      html += '<p class="pv-section-label">About</p>';
      html += `<p class="pv-bio">${_escape(basics.bio)}</p>`;
    }

    // --- Skills ---
    if (skills.length > 0) {
      html += '<div class="pv-divider"></div>';
      html += '<p class="pv-section-label">Skills</p>';
      html += '<div class="pv-tags">';
      skills.forEach(s => {
        html += `<span class="tag tag-${s.level}">${_escape(s.name)}</span>`;
      });
      html += '</div>';
    }

    // --- Projects ---
    if (projects.length > 0) {
      html += '<div class="pv-divider"></div>';
      html += '<p class="pv-section-label">Projects</p>';
      projects.forEach(p => {
        html += `<div class="pv-project">
          <p class="pv-project-title">${_escape(p.title)}</p>`;
        if (p.desc) {
          html += `<p class="pv-project-desc">${_escape(p.desc)}</p>`;
        }
        if (p.url) {
          html += `<p class="pv-project-url">${_escape(p.url)}</p>`;
        }
        html += '</div>';
      });
    }

    // --- Experience ---
    if (experience.length > 0) {
      html += '<div class="pv-divider"></div>';
      html += '<p class="pv-section-label">Experience</p>';
      experience.forEach(e => {
        const startStr = _formatDate(e.start);
        const endStr   = e.end ? _formatDate(e.end) : 'Present';
        html += `<div class="pv-exp">
          <p class="pv-exp-role">${_escape(e.role)}</p>
          <p class="pv-exp-company">${_escape(e.company)}</p>
          ${startStr ? `<p class="pv-exp-dates">${startStr} — ${endStr}</p>` : ''}
        </div>`;
      });
    }

    // --- Contact ---
    const hasContact = contact.email || contact.github || contact.linkedin;
    if (hasContact) {
      html += '<div class="pv-divider"></div>';
      html += '<p class="pv-section-label">Contact</p>';
      html += '<div class="pv-contact">';
      if (contact.email)    html += `<p class="pv-contact-item"><strong>Email</strong> ${_escape(contact.email)}</p>`;
      if (contact.github)   html += `<p class="pv-contact-item"><strong>GitHub</strong> ${_escape(contact.github)}</p>`;
      if (contact.linkedin) html += `<p class="pv-contact-item"><strong>LinkedIn</strong> ${_escape(contact.linkedin)}</p>`;
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // Escape HTML to prevent XSS
  function _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render(state) {
    if (!previewBody) return;
    previewBody.innerHTML = _buildPreviewHTML(state);
  }

  // Build full portfolio HTML for the modal view
  function buildFullPortfolio(state) {
    const { basics, skills, projects, experience, contact } = state;

    function _formatDate(monthStr) {
      if (!monthStr) return '';
      const [year, month] = monthStr.split('-');
      const months = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
      return `${months[parseInt(month, 10) - 1]} ${year}`;
    }

    let html = '';

    // Header
    html += `<div class="portfolio-header">
      <h1 class="portfolio-full-name" id="modal-name">${_escape(basics.fullName) || 'Your Name'}</h1>`;
    if (basics.tagline)  html += `<p class="portfolio-full-tagline">${_escape(basics.tagline)}</p>`;
    if (basics.location) html += `<p class="portfolio-full-location">📍 ${_escape(basics.location)}</p>`;
    html += '</div>';

    // Bio
    if (basics.bio) {
      html += `<div class="portfolio-section">
        <span class="portfolio-section-heading">About Me</span>
        <p class="portfolio-bio">${_escape(basics.bio)}</p>
      </div>`;
    }

    // Skills
    if (skills.length > 0) {
      html += `<div class="portfolio-section">
        <span class="portfolio-section-heading">Skills</span>
        <div class="portfolio-skills-grid">`;
      skills.forEach(s => {
        html += `<span class="tag tag-${s.level}">${_escape(s.name)} <em style="font-style:normal;opacity:0.7;font-size:0.85em;">(${s.level})</em></span>`;
      });
      html += '</div></div>';
    }

    // Projects
    if (projects.length > 0) {
      html += `<div class="portfolio-section">
        <span class="portfolio-section-heading">Projects</span>`;
      projects.forEach(p => {
        html += `<div class="portfolio-project">
          <p class="portfolio-project-title">${_escape(p.title)}</p>`;
        if (p.desc) html += `<p class="portfolio-project-desc">${_escape(p.desc)}</p>`;
        if (p.url)  html += `<a class="portfolio-project-url" href="${_escape(p.url)}" target="_blank" rel="noopener noreferrer">${_escape(p.url)}</a>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Experience
    if (experience.length > 0) {
      html += `<div class="portfolio-section">
        <span class="portfolio-section-heading">Experience</span>`;
      experience.forEach(e => {
        const start = _formatDate(e.start);
        const end   = e.end ? _formatDate(e.end) : 'Present';
        html += `<div class="portfolio-exp">
          <p class="portfolio-exp-role">${_escape(e.role)}</p>
          <p class="portfolio-exp-company">${_escape(e.company)}</p>
          ${start ? `<p class="portfolio-exp-dates">${start} — ${end}</p>` : ''}
        </div>`;
      });
      html += '</div>';
    }

    // Contact
    const hasContact = contact.email || contact.github || contact.linkedin;
    if (hasContact) {
      html += `<div class="portfolio-section">
        <span class="portfolio-section-heading">Contact</span>
        <div class="portfolio-contact-grid">`;
      if (contact.email) {
        html += `<div class="portfolio-contact-item">
          <span class="contact-label">Email</span>
          <a href="mailto:${_escape(contact.email)}">${_escape(contact.email)}</a>
        </div>`;
      }
      if (contact.github) {
        html += `<div class="portfolio-contact-item">
          <span class="contact-label">GitHub</span>
          <a href="${_escape(contact.github)}" target="_blank" rel="noopener noreferrer">${_escape(contact.github)}</a>
        </div>`;
      }
      if (contact.linkedin) {
        html += `<div class="portfolio-contact-item">
          <span class="contact-label">LinkedIn</span>
          <a href="${_escape(contact.linkedin)}" target="_blank" rel="noopener noreferrer">${_escape(contact.linkedin)}</a>
        </div>`;
      }
      html += '</div></div>';
    }

    return html;
  }

  return { render, buildFullPortfolio, _escape };

})();
