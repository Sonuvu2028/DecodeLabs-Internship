/* =============================================
   APP.JS — Main Application Logic (Project 1)
   Interactivity, state management, DOM updates
   ============================================= */

(function () {

  // ---- Cached DOM references ----
  const navToggle   = document.getElementById('navToggle');
  const navLinks    = document.getElementById('navLinks');
  const siteHeader  = document.querySelector('.site-header');
  const stepTabs    = document.querySelectorAll('.step-tab');
  const tabPanels   = document.querySelectorAll('.tab-panel');
  const formPanel   = document.querySelector('.form-panel');

  // Basics inputs
  const fullNameInput  = document.getElementById('fullName');
  const taglineInput   = document.getElementById('tagline');
  const bioInput       = document.getElementById('bio');
  const locationInput  = document.getElementById('location');

  // Skills
  const skillInput     = document.getElementById('skillInput');
  const skillLevel     = document.getElementById('skillLevel');
  const addSkillBtn    = document.getElementById('addSkillBtn');
  const skillsList     = document.getElementById('skillsList');

  // Projects
  const projTitle      = document.getElementById('projTitle');
  const projDesc       = document.getElementById('projDesc');
  const projUrl        = document.getElementById('projUrl');
  const addProjectBtn  = document.getElementById('addProjectBtn');
  const projectsList   = document.getElementById('projectsList');

  // Experience
  const expRole        = document.getElementById('expRole');
  const expCompany     = document.getElementById('expCompany');
  const expStart       = document.getElementById('expStart');
  const expEnd         = document.getElementById('expEnd');
  const addExpBtn      = document.getElementById('addExpBtn');
  const expList        = document.getElementById('expList');

  // Contact
  const contactEmail   = document.getElementById('contactEmail');
  const contactGithub  = document.getElementById('contactGithub');
  const contactLinkedin= document.getElementById('contactLinkedin');
  const saveBtn        = document.getElementById('savePortfolioBtn');

  // Modal
  const portfolioModal = document.getElementById('portfolioModal');
  const modalBackdrop  = document.getElementById('modalBackdrop');
  const modalContent   = document.getElementById('modalContent');
  const modalClose     = document.getElementById('modalClose');
  const copyBtn        = document.getElementById('copyPortfolioBtn');
  const editBtn        = document.getElementById('editPortfolioBtn');

  // Track current saved portfolio ID
  let _currentPortfolioId = null;

  // =============================================
  // INIT
  // =============================================
  function init() {
    // Subscribe preview to state changes
    State.subscribe(Preview.render);

    // Inject API status bar
    API.injectStatusBar(formPanel);

    // Wire up all event listeners
    bindNav();
    bindTabSwitching();
    bindBasicsInputs();
    bindSkills();
    bindProjects();
    bindExperience();
    bindContact();
    bindSave();
    bindModal();
    bindScrollHeader();
  }

  // =============================================
  // NAV — hamburger toggle (mobile)
  // =============================================
  function bindNav() {
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close nav when a link is clicked (mobile)
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =============================================
  // SCROLL — add shadow to header on scroll
  // =============================================
  function bindScrollHeader() {
    window.addEventListener('scroll', () => {
      if (siteHeader) {
        siteHeader.classList.toggle('scrolled', window.scrollY > 10);
      }
    }, { passive: true });
  }

  // =============================================
  // TAB SWITCHING — step tabs
  // =============================================
  function bindTabSwitching() {
    stepTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    // Next/Prev buttons inside tab panels
    document.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.next;

        // Validate current tab before moving forward
        if (btn.closest('#tab-basics')) {
          if (!Validation.validateBasics()) return;
          // Save basics to state
          State.updateBasics('fullName', fullNameInput.value);
          State.updateBasics('tagline',  taglineInput.value);
          State.updateBasics('bio',      bioInput.value);
          State.updateBasics('location', locationInput.value);
        }

        if (btn.closest('#tab-contact')) {
          if (!Validation.validateContact()) return;
        }

        switchTab(targetTab);
      });
    });

    document.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.prev);
      });
    });
  }

  function switchTab(tabName) {
    stepTabs.forEach(t => {
      const isActive = t.dataset.tab === tabName;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive.toString());
    });

    tabPanels.forEach(panel => {
      const isActive = panel.id === 'tab-' + tabName;
      if (isActive) {
        panel.removeAttribute('hidden');
        panel.classList.add('active');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('active');
      }
    });
  }

  // =============================================
  // BASICS — real-time state updates
  // =============================================
  function bindBasicsInputs() {
    [
      [fullNameInput,  'fullName'],
      [taglineInput,   'tagline'],
      [bioInput,       'bio'],
      [locationInput,  'location']
    ].forEach(([el, field]) => {
      if (!el) return;
      el.addEventListener('input', () => {
        State.updateBasics(field, el.value);
        // Clear error on input
        Validation.clearError(el.id);
      });
    });
  }

  // =============================================
  // SKILLS — add / remove
  // =============================================
  function bindSkills() {
    if (!addSkillBtn) return;

    addSkillBtn.addEventListener('click', handleAddSkill);
    skillInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSkill();
      }
    });
  }

  function handleAddSkill() {
    const name  = skillInput.value;
    const level = skillLevel.value;

    if (!Validation.validateSkillInput(name)) return;

    State.addSkill(name, level);
    skillInput.value = '';
    skillInput.focus();
    renderSkillsList();
    Validation.clearCustomError('skill-error');
  }

  function renderSkillsList() {
    if (!skillsList) return;
    const { skills } = State.getState();

    if (skills.length === 0) {
      skillsList.innerHTML = '<div class="empty-state">No skills added yet.</div>';
      return;
    }

    skillsList.innerHTML = skills.map(s => `
      <div class="skill-item" data-id="${s.id}">
        <div class="skill-item-left">
          <span class="skill-name">${Preview._escape(s.name)}</span>
          <span class="tag tag-${s.level}">${s.level}</span>
        </div>
        <button class="remove-btn" 
                data-remove-skill="${s.id}" 
                aria-label="Remove skill ${Preview._escape(s.name)}">✕</button>
      </div>`).join('');

    // Bind remove buttons
    skillsList.querySelectorAll('[data-remove-skill]').forEach(btn => {
      btn.addEventListener('click', () => {
        State.removeSkill(btn.dataset.removeSkill);
        renderSkillsList();
      });
    });
  }

  // =============================================
  // PROJECTS — add / remove
  // =============================================
  function bindProjects() {
    if (!addProjectBtn) return;
    addProjectBtn.addEventListener('click', handleAddProject);
  }

  function handleAddProject() {
    const title = projTitle.value;
    const desc  = projDesc.value;
    const url   = projUrl.value;

    if (!Validation.validateProjectInput(title)) return;

    State.addProject(title, desc, url);
    projTitle.value = '';
    projDesc.value  = '';
    projUrl.value   = '';
    projTitle.focus();
    renderProjectsList();
    Validation.clearCustomError('project-error');
  }

  function renderProjectsList() {
    if (!projectsList) return;
    const { projects } = State.getState();

    if (projects.length === 0) {
      projectsList.innerHTML = '<div class="empty-state">No projects added yet.</div>';
      return;
    }

    projectsList.innerHTML = projects.map(p => `
      <div class="project-card" data-id="${p.id}">
        <p class="project-card-title">${Preview._escape(p.title)}</p>
        ${p.desc ? `<p class="project-card-desc">${Preview._escape(p.desc)}</p>` : ''}
        ${p.url  ? `<p class="project-card-desc" style="color:var(--blue-dark);margin-top:4px;">${Preview._escape(p.url)}</p>` : ''}
        <button class="remove-btn card-remove" 
                data-remove-project="${p.id}" 
                aria-label="Remove project ${Preview._escape(p.title)}">✕</button>
      </div>`).join('');

    projectsList.querySelectorAll('[data-remove-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        State.removeProject(btn.dataset.removeProject);
        renderProjectsList();
      });
    });
  }

  // =============================================
  // EXPERIENCE — add / remove
  // =============================================
  function bindExperience() {
    if (!addExpBtn) return;
    addExpBtn.addEventListener('click', handleAddExperience);
  }

  function handleAddExperience() {
    const role    = expRole.value;
    const company = expCompany.value;
    const start   = expStart.value;
    const end     = expEnd.value;

    if (!Validation.validateExperienceInput(role, company)) return;

    State.addExperience(role, company, start, end);
    expRole.value    = '';
    expCompany.value = '';
    expStart.value   = '';
    expEnd.value     = '';
    expRole.focus();
    renderExpList();
    Validation.clearCustomError('exp-error');
  }

  function renderExpList() {
    if (!expList) return;
    const { experience } = State.getState();

    if (experience.length === 0) {
      expList.innerHTML = '<div class="empty-state">No experience added yet.</div>';
      return;
    }

    expList.innerHTML = experience.map(e => `
      <div class="exp-card" data-id="${e.id}">
        <p class="exp-card-title">${Preview._escape(e.role)}</p>
        <p class="exp-card-sub">${Preview._escape(e.company)}</p>
        ${e.start ? `<p class="exp-card-sub" style="margin-top:4px;color:var(--mocha);">${e.start} ${e.end ? '→ ' + e.end : '→ Present'}</p>` : ''}
        <button class="remove-btn card-remove" 
                data-remove-exp="${e.id}" 
                aria-label="Remove experience ${Preview._escape(e.role)}">✕</button>
      </div>`).join('');

    expList.querySelectorAll('[data-remove-exp]').forEach(btn => {
      btn.addEventListener('click', () => {
        State.removeExperience(btn.dataset.removeExp);
        renderExpList();
      });
    });
  }

  // =============================================
  // CONTACT — real-time state updates
  // =============================================
  function bindContact() {
    [
      [contactEmail,    'email'],
      [contactGithub,   'github'],
      [contactLinkedin, 'linkedin']
    ].forEach(([el, field]) => {
      if (!el) return;
      el.addEventListener('input', () => {
        State.updateContact(field, el.value);
        Validation.clearError(el.id);
      });
    });
  }

  // =============================================
  // SAVE — POST /portfolios API call
  // =============================================
  function bindSave() {
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
      // Final validation before API call
      const errors = Validation.validateForSave();
      if (errors.length > 0) {
        alert('Please fix the following before saving:\n\n• ' + errors.join('\n• '));
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const state = State.getState();

      // POST /portfolios
      const result = await API.createPortfolio(state);

      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & View Portfolio →';

      if (result.success) {
        _currentPortfolioId = result.data.id;
        openModal(state);
      } else {
        // 400 Bad Request — show errors
        alert('Could not save portfolio:\n\n' + result.message + '\n\nStatus: ' + result.statusCode);
      }
    });
  }

  // =============================================
  // MODAL — show full portfolio
  // =============================================
  function openModal(state) {
    const html = Preview.buildFullPortfolio(state);
    modalContent.innerHTML = html;
    portfolioModal.removeAttribute('hidden');
    modalBackdrop.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    portfolioModal.setAttribute('hidden', '');
    modalBackdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';
    saveBtn.focus();
  }

  function bindModal() {
    if (!modalClose) return;

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !portfolioModal.hasAttribute('hidden')) {
        closeModal();
      }
    });

    // Edit button — close modal, go back to form
    if (editBtn) {
      editBtn.addEventListener('click', closeModal);
    }

    // Copy portfolio data as JSON
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const state = State.getState();
        const text = JSON.stringify(state, null, 2);
        try {
          await navigator.clipboard.writeText(text);
          const original = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = original; }, 2000);
        } catch {
          // Fallback for browsers without clipboard API
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Portfolio Data'; }, 2000);
        }
      });
    }
  }

  // =============================================
  // START
  // =============================================
  document.addEventListener('DOMContentLoaded', init);

})();
