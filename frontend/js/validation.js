/* =============================================
   VALIDATION.JS — Client-side Form Validation
   Syntactic: format correct?
   Semantic:  logic valid?
   ============================================= */

const Validation = (() => {

  // --- Syntactic Validators ---

  function isNonEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function isValidEmail(value) {
    // Syntactic: does it match email format?
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  function isValidUrl(value) {
    if (!value || value.trim() === '') return true; // URL is optional
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function isMinLength(value, min) {
    return typeof value === 'string' && value.trim().length >= min;
  }

  // --- Show/clear field error ---

  function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function showCustomError(errorElId, message) {
    const el = document.getElementById(errorElId);
    if (el) el.textContent = message;
  }

  function clearCustomError(errorElId) {
    const el = document.getElementById(errorElId);
    if (el) el.textContent = '';
  }

  // --- Section validators ---

  function validateBasics() {
    let valid = true;

    const name = document.getElementById('fullName').value;
    const bio  = document.getElementById('bio').value;

    clearError('fullName');
    clearError('bio');

    // Syntactic: is name non-empty?
    if (!isNonEmpty(name)) {
      showError('fullName', 'Full name is required.');
      valid = false;
    } else if (!isMinLength(name, 2)) {
      showError('fullName', 'Name must be at least 2 characters.');
      valid = false;
    }

    // Syntactic: is bio non-empty?
    if (!isNonEmpty(bio)) {
      showError('bio', 'Bio is required — tell us about yourself.');
      valid = false;
    } else if (!isMinLength(bio, 20)) {
      showError('bio', 'Bio should be at least 20 characters.');
      valid = false;
    }

    return valid;
  }

  function validateSkillInput(name) {
    clearCustomError('skill-error');

    if (!isNonEmpty(name)) {
      showCustomError('skill-error', 'Please enter a skill name.');
      return false;
    }

    // Semantic: is this skill already added?
    const state = State.getState();
    const duplicate = state.skills.find(
      s => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      showCustomError('skill-error', 'This skill has already been added.');
      return false;
    }

    return true;
  }

  function validateProjectInput(title) {
    clearCustomError('project-error');

    if (!isNonEmpty(title)) {
      showCustomError('project-error', 'Project title is required.');
      return false;
    }

    const url = document.getElementById('projUrl').value;
    if (!isValidUrl(url)) {
      showCustomError('project-error', 'Project URL must be a valid http/https URL.');
      return false;
    }

    return true;
  }

  function validateExperienceInput(role, company) {
    clearCustomError('exp-error');

    if (!isNonEmpty(role)) {
      showCustomError('exp-error', 'Role / Position is required.');
      return false;
    }

    if (!isNonEmpty(company)) {
      showCustomError('exp-error', 'Company / Organisation is required.');
      return false;
    }

    return true;
  }

  function validateContact() {
    let valid = true;

    const email = document.getElementById('contactEmail').value;
    clearError('contactEmail');

    // Syntactic: correct email format?
    if (!isNonEmpty(email)) {
      showError('contactEmail', 'Email address is required.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('contactEmail', 'Please enter a valid email address.');
      valid = false;
    }

    return valid;
  }

  // --- Final save validation ---
  function validateForSave() {
    const state = State.getState();
    const errors = [];

    if (!isNonEmpty(state.basics.fullName)) {
      errors.push('Full name is required (Basics tab).');
    }
    if (!isNonEmpty(state.basics.bio)) {
      errors.push('Bio is required (Basics tab).');
    }
    if (!isValidEmail(state.contact.email)) {
      errors.push('A valid email is required (Contact tab).');
    }

    return errors;
  }

  return {
    isNonEmpty,
    isValidEmail,
    isValidUrl,
    isMinLength,
    showError,
    clearError,
    showCustomError,
    clearCustomError,
    validateBasics,
    validateSkillInput,
    validateProjectInput,
    validateExperienceInput,
    validateContact,
    validateForSave
  };

})();
