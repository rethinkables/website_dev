/* =========================================================================
   RETHINKABLES TECHNOLOGY — Enhanced Main JavaScript
   
   ARCHITECTURE:
   - Modular, testable code structure
   - Accessibility-first approach (WCAG 2.1 AA)
   - Performance-optimized (lazy initialization)
   - Error handling with graceful degradation
   - Form validation with real-time feedback
   - DPDP Act 2023 compliance
   
   ========================================================================= */

// =========================================================================
// 1. UTILITY MODULE — Shared helpers
// =========================================================================
const Rethinkables = {
  // Configuration
  CONFIG: {
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwvhJZpRngeCJoNNShy0Z6kHkbJMqZDAMiyQ3ji53TP1Ko6gnb7O8JPYqUJIipypCzX/exec",
    FORM_SUBMIT_TIMEOUT: 8000,
    SCROLL_THRESHOLD: 40,
    INTERSECTION_THRESHOLD: 0.1,
    RESPONSE_WAIT_DAYS: 2
  },

  // Safe DOM query wrapper
  query: (selector) => document.querySelector(selector),
  queryAll: (selector) => document.querySelectorAll(selector),

  // Safe element check
  hasElement: (selector) => !!document.querySelector(selector),

  // Log utility (development/debugging)
  log: (message, data = null) => {
    if (data) console.log(`[Rethinkables] ${message}`, data);
    else console.log(`[Rethinkables] ${message}`);
  },

  // Error logger
  logError: (message, error = null) => {
    console.error(`[Rethinkables ERROR] ${message}`, error);
  }
};

// =========================================================================
// 2. NAVIGATION MODULE — Scroll effects & state management
// =========================================================================
const NavigationModule = {
  nav: null,
  scrollThreshold: Rethinkables.CONFIG.SCROLL_THRESHOLD,
  isScrolled: false,

  init() {
    this.nav = Rethinkables.query('#nav');
    if (!this.nav) return;

    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    Rethinkables.log('Navigation module initialized');
  },

  handleScroll() {
    const shouldBeScrolled = window.scrollY > this.scrollThreshold;
    
    if (shouldBeScrolled !== this.isScrolled) {
      this.isScrolled = shouldBeScrolled;
      this.updateNavState();
    }
  },

  updateNavState() {
    if (this.isScrolled) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
  }
};

// =========================================================================
// 3. SCROLL ANIMATION MODULE — Intersection Observer for reveal effects
// =========================================================================
const ScrollAnimationModule = {
  observer: null,

  init() {
    const observerOptions = {
      threshold: Rethinkables.CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: unobserve after animation to save memory
          // this.observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    Rethinkables.queryAll('.reveal').forEach(el => {
      this.observer.observe(el);
    });

    Rethinkables.log('Scroll animation module initialized');
  },

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
};

// =========================================================================
// 4. MODAL MODULE — Dialog management with accessibility
// =========================================================================
const ModalModule = {
  modal: null,
  openBtns: null,
  closeBtn: null,
  isOpen: false,

  init() {
    this.modal = Rethinkables.query('#solutionModal');
    this.openBtns = Rethinkables.queryAll('.open-modal-btn');
    this.closeBtn = Rethinkables.query('#modalCloseBtn');

    if (!this.modal) return;

    // Event listeners
    this.openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    Rethinkables.log('Modal module initialized');
  },

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const firstInput = this.modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }

    Rethinkables.log('Modal opened');
  },

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';

    Rethinkables.log('Modal closed');
  }
};

// =========================================================================
// 5. FORM MODULE — Validation, submission, compliance
// =========================================================================
const FormModule = {
  form: null,
  categorySelect: null,
  otherSectorWrapper: null,
  otherSectorInput: null,
  submitBtn: null,
  formFields: {},
  isSubmitting: false,

  init() {
    this.form = Rethinkables.query('#govForm');
    this.categorySelect = Rethinkables.query('#challenge_category');
    this.otherSectorWrapper = Rethinkables.query('#other_sector_wrapper');
    this.otherSectorInput = Rethinkables.query('#other_sector_input');
    this.submitBtn = Rethinkables.query('#submitBtn');

    if (!this.form) return;

    // Store form field references
    this.cacheFormFields();

    // Event listeners
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', () => this.handleDepartmentChange());
    }

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time validation on input
    Object.values(this.formFields).forEach(field => {
      if (field) {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearFieldError(field));
      }
    });

    Rethinkables.log('Form module initialized');
  },

  cacheFormFields() {
    this.formFields = {
      department: Rethinkables.query('#challenge_category'),
      problem: Rethinkables.query('#problem'),
      officer_name: Rethinkables.query('#officer_name'),
      office: Rethinkables.query('#department'),
      division: Rethinkables.query('#division'),
      contact: Rethinkables.query('#contact_info')
    };
  },

  handleDepartmentChange() {
    const isOther = this.categorySelect.value === 'Other';
    
    if (isOther) {
      this.otherSectorWrapper.style.display = 'flex';
      this.otherSectorInput.required = true;
      this.otherSectorInput.focus();
    } else {
      this.otherSectorWrapper.style.display = 'none';
      this.otherSectorInput.required = false;
      this.otherSectorInput.value = '';
      this.clearFieldError(this.otherSectorInput);
    }
  },

  validateField(field) {
    if (!field) return true;

    let isValid = true;
    const value = field.value.trim();
    const errorClass = 'field-error';

    // Reset error state
    field.classList.remove(errorClass);

    if (field.required && !value) {
      isValid = false;
      field.classList.add(errorClass);
      this.showFieldError(field, 'This field is required');
    } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      field.classList.add(errorClass);
      this.showFieldError(field, 'Please enter a valid email');
    } else if (field.id === 'contact_info' && value && !this.isValidContact(value)) {
      isValid = false;
      field.classList.add(errorClass);
      this.showFieldError(field, 'Please enter a valid email or phone number');
    } else if (field.id === 'problem' && value.length < 20) {
      isValid = false;
      field.classList.add(errorClass);
      this.showFieldError(field, 'Please provide more detail (at least 20 characters)');
    }

    return isValid;
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidContact(contact) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{8,}$/;
    return emailRegex.test(contact) || phoneRegex.test(contact);
  },

  showFieldError(field, message) {
    let errorEl = field.nextElementSibling;
    
    if (errorEl && errorEl.classList.contains('field-error-msg')) {
      errorEl.textContent = message;
    } else {
      errorEl = document.createElement('small');
      errorEl.className = 'field-error-msg';
      errorEl.style.color = 'var(--gold)';
      errorEl.style.fontSize = '0.8rem';
      errorEl.style.marginTop = '0.3rem';
      errorEl.style.display = 'block';
      errorEl.textContent = message;
      field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
  },

  clearFieldError(field) {
    field.classList.remove('field-error');
    const errorEl = field.nextElementSibling;
    if (errorEl && errorEl.classList.contains('field-error-msg')) {
      errorEl.remove();
    }
  },

  async handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    let isFormValid = true;
    Object.values(this.formFields).forEach(field => {
      if (!this.validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showError('Please fix the errors above before submitting.');
      return;
    }

    // Check consent (if checkbox exists)
    const consentCheckbox = Rethinkables.query('#consent-checkbox');
    if (consentCheckbox && !consentCheckbox.checked) {
      this.showError('Please agree to the privacy notice before submitting.');
      return;
    }

    await this.submitForm();
  },

  async submitForm() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.updateSubmitButton(true);

    try {
      const selectedCat = this.categorySelect.value;
      const customCat = this.otherSectorInput.value;
      const finalCategory = selectedCat === 'Other' ? `Other: ${customCat}` : selectedCat;

      const payload = {
        officer_name: this.formFields.officer_name?.value || '',
        department: this.formFields.office?.value || '',
        division: this.formFields.division?.value || '',
        contact: this.formFields.contact?.value || '',
        challenge: finalCategory,
        problem: this.formFields.problem?.value || '',
        timestamp: new Date().toISOString(),
        consent_given: 'yes'
      };

      // Fetch with timeout
      const response = await Promise.race([
        fetch(Rethinkables.CONFIG.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), Rethinkables.CONFIG.FORM_SUBMIT_TIMEOUT)
        )
      ]);

      // Success state
      this.showSuccess(`Thank you — your message has reached us. We'll respond to ${this.formFields.contact?.value} within ${Rethinkables.CONFIG.RESPONSE_WAIT_DAYS} business days.`);
      this.form.reset();
      
      if (this.otherSectorWrapper) {
        this.otherSectorWrapper.style.display = 'none';
      }

      Rethinkables.log('Form submitted successfully', payload);

      // Close modal after 2 seconds
      setTimeout(() => {
        ModalModule.close();
      }, 2000);

    } catch (error) {
      Rethinkables.logError('Form submission failed', error);
      this.showError('Connection issue. Please try again or email contact@rethinkables.in');
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton(false);
    }
  },

  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  showError(message) {
    this.showNotification(message, 'error');
  },

  showNotification(message, type) {
    // Remove existing notification
    const existing = Rethinkables.query('.form-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `form-notification form-notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.style.cssText = `
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 3px;
      font-size: 0.9rem;
      line-height: 1.5;
      border-left: 4px solid ${type === 'success' ? 'var(--green)' : 'var(--gold)'};
      background: ${type === 'success' ? 'rgba(10, 63, 49, 0.1)' : 'rgba(181, 126, 31, 0.1)'};
      color: ${type === 'success' ? 'var(--green)' : 'var(--gold)'};
    `;
    notification.textContent = message;

    this.form.insertBefore(notification, this.form.firstChild);

    // Auto-remove success messages
    if (type === 'success') {
      setTimeout(() => notification.remove(), 4000);
    }
  },

  updateSubmitButton(isLoading) {
    if (!this.submitBtn) return;

    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Sending...';
      this.submitBtn.style.opacity = '0.7';
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Send to Rethinkables';
      this.submitBtn.style.opacity = '1';
    }
  }
};

// =========================================================================
// 6. INITIALIZATION — Bootstrap all modules on DOM ready
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    NavigationModule.init();
    ScrollAnimationModule.init();
    ModalModule.init();
    FormModule.init();

    Rethinkables.log('All modules initialized successfully');
  } catch (error) {
    Rethinkables.logError('Initialization error', error);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  ScrollAnimationModule.destroy();
});
