/**
 * GURGAON LUXURY PROPERTY ADVISORY — JAVASCRIPT ENGINE
 * Features:
 * 1. Ad Analytics & Conversion Event Dispatcher (GTM, GA4, Meta Pixel)
 * 2. Dynamic Modal & Prefill Controller
 * 3. Interactive Section 5 Preference Builder State Sync
 * 4. Desktop Exit-Intent Trigger Engine
 * 5. Server-Side Email Lead Dispatch (/api/submit-lead) with UTM & Timestamp Capture
 * 6. Spam Protection (Honeypot Validation) & Error Alert Handlers
 * 7. Mobile Sticky CTA Visibility Observer
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. UTM & ATTRIBUTION CAPTURE ENGINE
  // ==========================================================================
  const Attribution = {
    getParams: function () {
      const urlParams = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const data = {};

      utmKeys.forEach(key => {
        const val = urlParams.get(key);
        if (val) {
          data[key] = val;
          try {
            sessionStorage.setItem(`lead_${key}`, val);
          } catch (e) {}
        } else {
          try {
            data[key] = sessionStorage.getItem(`lead_${key}`) || 'direct';
          } catch (e) {
            data[key] = 'direct';
          }
        }
      });

      return data;
    }
  };

  // ==========================================================================
  // 2. ANALYTICS & ADS TRACKING DISPATCHER
  // ==========================================================================
  const Analytics = {
    track: function (eventName, eventParams = {}) {
      const payload = {
        event: eventName,
        timestamp: new Date().toISOString(),
        page_location: window.location.href,
        page_title: document.title,
        ...eventParams
      };

      // 1. Google Tag Manager / dataLayer push
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push(payload);
      }

      // 2. Google Analytics 4 gtag event
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams);
      }

      // 3. Meta Pixel (Facebook Ads) tracking
      if (typeof window.fbq === 'function') {
        if (eventName === 'lead_submit') {
          window.fbq('track', 'Lead', {
            content_name: 'Gurgaon Property Enquiry',
            value: eventParams.budget || 'Unspecified',
            currency: 'INR'
          });
        } else {
          window.fbq('trackCustom', eventName, eventParams);
        }
      }

      // Debug Log for Development & QA
      console.log(`[Ad-Analytics Event: ${eventName}]`, payload);
    }
  };

  // Expose to window for external scripts if needed
  window.PropertyAdvisoryAnalytics = Analytics;

  // Track initial page view & lead form view
  document.addEventListener('DOMContentLoaded', () => {
    Analytics.track('lead_form_view', { source: 'landing_page_load' });
  });

  // ==========================================================================
  // 3. MODAL CONTROLLER & PRE-FILL SYSTEM
  // ==========================================================================
  const Modal = {
    leadModal: document.getElementById('lead-modal'),
    exitModal: document.getElementById('exit-intent-modal'),
    formView: document.getElementById('modal-form-view'),
    successView: document.getElementById('modal-success-view'),
    modalForm: document.getElementById('modal-lead-form'),

    openLeadModal: function (options = {}) {
      if (!this.leadModal) return;

      // Reset modal state views & error alerts
      if (this.formView) this.formView.classList.remove('hidden');
      if (this.successView) this.successView.classList.add('hidden');
      
      const modalAlert = this.leadModal.querySelector('.form-error-alert');
      if (modalAlert) modalAlert.classList.add('hidden');

      // Pre-fill form fields if provided
      if (this.modalForm) {
        if (options.budget) {
          const budgetSelect = this.modalForm.querySelector('#modal-budget');
          if (budgetSelect) budgetSelect.value = options.budget;
        }
        if (options.location) {
          const locSelect = this.modalForm.querySelector('#modal-location');
          if (locSelect) locSelect.value = options.location;
        }
        if (options.propertyType) {
          const propSelect = this.modalForm.querySelector('#modal-property-type');
          if (propSelect) propSelect.value = options.propertyType;
        }
        if (options.lookingFor) {
          const lookSelect = this.modalForm.querySelector('#modal-looking-for');
          if (lookSelect) lookSelect.value = options.lookingFor;
        }
        if (options.sourceCta) {
          const hiddenSource = this.modalForm.querySelector('#modal-hidden-source');
          if (hiddenSource) hiddenSource.value = options.sourceCta;
        }
      }

      // Show modal
      this.leadModal.classList.add('is-active');
      this.leadModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Dispatch tracking event
      Analytics.track('popup_open', {
        popup_type: 'lead_enquiry_modal',
        prefilled_budget: options.budget || 'none',
        source_cta: options.sourceCta || 'direct'
      });
    },

    closeAllModals: function () {
      const activeModals = document.querySelectorAll('.modal-backdrop.is-active');
      activeModals.forEach(modal => {
        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
      });
      document.body.style.overflow = '';
    },

    showSuccess: function () {
      if (this.formView) this.formView.classList.add('hidden');
      if (this.successView) this.successView.classList.remove('hidden');
    }
  };

  // Close modals on close button click or backdrop click
  document.addEventListener('click', function (e) {
    if (e.target.closest('.modal-close-btn') || e.target.closest('#modal-done-btn')) {
      Modal.closeAllModals();
    } else if (e.target.classList.contains('modal-backdrop')) {
      Modal.closeAllModals();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      Modal.closeAllModals();
    }
  });

  // ==========================================================================
  // 4. CTA BUTTON TRIGGERS & BUDGET EVENT TRACKING
  // ==========================================================================
  document.addEventListener('click', function (e) {
    const ctaBtn = e.target.closest('.open-lead-modal');
    if (!ctaBtn) return;

    e.preventDefault();

    const budget = ctaBtn.getAttribute('data-budget') || '';
    const sourceCta = ctaBtn.getAttribute('data-cta-source') || ctaBtn.id || 'unspecified_cta';

    // Track CTA Click
    Analytics.track('cta_click', {
      cta_id: ctaBtn.id || 'button',
      cta_text: ctaBtn.innerText.trim().replace(/\s+/g, ' '),
      cta_source: sourceCta,
      budget: budget || 'unspecified'
    });

    // Track Budget Specific Events
    if (budget === 'Under ₹3 Cr') {
      Analytics.track('budget_under_3cr', { source: sourceCta });
    } else if (budget === '₹5–10 Cr') {
      Analytics.track('budget_5_10cr', { source: sourceCta });
    } else if (budget === '₹10 Cr+') {
      Analytics.track('budget_10cr_plus', { source: sourceCta });
    }

    // Open Lead Modal with preselected values
    Modal.openLeadModal({
      budget: budget,
      sourceCta: sourceCta
    });
  });

  // Track phone clicks if user taps on any phone link or action
  document.addEventListener('click', function (e) {
    const phoneEl = e.target.closest('a[href^="tel:"]');
    if (phoneEl) {
      Analytics.track('phone_click', { href: phoneEl.getAttribute('href') });
    }
  });

  // ==========================================================================
  // 5. SECTION 5 — INTERACTIVE PREFERENCE BUILDER
  // ==========================================================================
  const selectedPreferences = {
    budget: 'Under ₹3 Cr',
    purpose: 'End Use',
    propertyType: 'Apartment',
    location: 'Golf Course Road'
  };

  const prefChips = document.querySelectorAll('.pref-chip');
  prefChips.forEach(chip => {
    chip.addEventListener('click', function () {
      const group = this.getAttribute('data-group');
      const value = this.getAttribute('data-value');

      if (!group || !value) return;

      // Update active state in UI
      const siblings = document.querySelectorAll(`.pref-chip[data-group="${group}"]`);
      siblings.forEach(s => s.classList.remove('active'));
      this.classList.add('active');

      // Update state
      selectedPreferences[group] = value;

      // Track selection
      Analytics.track('preference_chip_select', {
        group: group,
        selected_value: value
      });
    });
  });

  const prefCtaBtn = document.getElementById('preference-cta-btn');
  if (prefCtaBtn) {
    prefCtaBtn.addEventListener('click', function () {
      Analytics.track('cta_click', {
        cta_source: 'preference_builder_cta',
        preferences: { ...selectedPreferences }
      });

      // Open modal with all 4 preferences pre-populated
      Modal.openLeadModal({
        budget: selectedPreferences.budget,
        location: selectedPreferences.location,
        propertyType: selectedPreferences.propertyType,
        lookingFor: selectedPreferences.purpose,
        sourceCta: 'preference_builder_cta'
      });
    });
  }

  // ==========================================================================
  // 6. FORM VALIDATION & SERVER-SIDE SUBMISSION CONTROLLER
  // ==========================================================================
  function validateForm(form) {
    let isValid = true;

    // 1. Name validation
    const nameInput = form.querySelector('input[name="name"]');
    if (nameInput) {
      const nameGroup = nameInput.closest('.form-group');
      const nameVal = nameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        if (nameGroup) nameGroup.classList.add('has-error');
        nameInput.classList.add('is-invalid');
        isValid = false;
      } else {
        if (nameGroup) nameGroup.classList.remove('has-error');
        nameInput.classList.remove('is-invalid');
      }
    }

    // 2. Phone validation (Indian 10-digit standard / +91)
    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
      const phoneGroup = phoneInput.closest('.form-group');
      const phoneVal = phoneInput.value.replace(/[^0-9]/g, '');
      if (phoneVal.length < 10 || phoneVal.length > 13) {
        if (phoneGroup) phoneGroup.classList.add('has-error');
        phoneInput.classList.add('is-invalid');
        isValid = false;
      } else {
        if (phoneGroup) phoneGroup.classList.remove('has-error');
        phoneInput.classList.remove('is-invalid');
      }
    }

    // 3. Email validation (if provided or required)
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      const emailGroup = emailInput.closest('.form-group');
      const emailVal = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        if (emailGroup) emailGroup.classList.add('has-error');
        emailInput.classList.add('is-invalid');
        isValid = false;
      } else {
        if (emailGroup) emailGroup.classList.remove('has-error');
        emailInput.classList.remove('is-invalid');
      }
    }

    // 4. Budget validation (select element)
    const budgetSelect = form.querySelector('select[name="budget"]');
    if (budgetSelect && budgetSelect.hasAttribute('required')) {
      const budgetGroup = budgetSelect.closest('.form-group');
      if (!budgetSelect.value) {
        if (budgetGroup) budgetGroup.classList.add('has-error');
        budgetSelect.classList.add('is-invalid');
        isValid = false;
      } else {
        if (budgetGroup) budgetGroup.classList.remove('has-error');
        budgetSelect.classList.remove('is-invalid');
      }
    }

    return isValid;
  }

  // Bind real-time input error clearing & lead_form_start tracking
  const allForms = document.querySelectorAll('.lead-capture-form');
  allForms.forEach(form => {
    let formStarted = false;

    form.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('input', function () {
        const group = this.closest('.form-group');
        if (group) group.classList.remove('has-error');
        this.classList.remove('is-invalid');

        // Hide form-level error alert when user edits
        const alertBox = form.querySelector('.form-error-alert');
        if (alertBox) alertBox.classList.add('hidden');

        if (!formStarted) {
          formStarted = true;
          Analytics.track('lead_form_start', {
            form_type: form.getAttribute('data-form-type') || 'unknown'
          });
        }
      });
    });

    // Form submission handler with Server Email Notification
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Clear previous error alerts
      const alertBox = form.querySelector('.form-error-alert');
      if (alertBox) alertBox.classList.add('hidden');

      if (!validateForm(form)) {
        return;
      }

      // Collect form data
      const formData = new FormData(form);
      const dataObj = {};
      formData.forEach((value, key) => {
        dataObj[key] = value;
      });

      // Extract budget, looking_for, location, property_type
      const budget = dataObj.budget || dataObj.main_budget || 'Under ₹3 Cr';
      const lookingFor = dataObj.looking_for || dataObj.hero_purpose || dataObj.main_looking_for || 'End Use';
      const location = dataObj.location || 'Not Specified';
      const propertyType = dataObj.property_type || 'Not Specified';
      const formType = form.getAttribute('data-form-type') || 'lead_form';
      const honeypotVal = dataObj.website_url_hp || '';

      // Capture UTM parameters & timestamp
      const utms = Attribution.getParams();
      const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const landingPageUrl = window.location.href;

      // Prepare payload for backend email dispatch
      const payload = {
        name: dataObj.name || '',
        phone: dataObj.phone || '',
        email: dataObj.email || '',
        budget: budget,
        looking_for: lookingFor,
        location: location,
        property_type: propertyType,
        website_url_hp: honeypotVal,
        page_url: landingPageUrl,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_term: utms.utm_term,
        utm_content: utms.utm_content,
        submitted_at: submittedAt
      };

      // Show submit button loading spinner
      const submitBtn = form.querySelector('.btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        const spinner = submitBtn.querySelector('.btn-spinner');
        if (spinner) spinner.classList.remove('hidden');
      }

      // Helper to dynamically resolve API endpoint across local dev, file preview, or production
      function getCandidateEndpoints() {
        const endpoints = [];
        if (window.location.protocol.startsWith('http')) {
          endpoints.push('/api/submit-lead');
        }
        endpoints.push('http://localhost:3000/api/submit-lead');
        endpoints.push('http://127.0.0.1:3000/api/submit-lead');
        return endpoints;
      }

      let submissionSuccess = false;
      const endpointsToTry = getCandidateEndpoints();

      for (const endpoint of endpointsToTry) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json().catch(() => null);

          if (response.ok && result && result.success) {
            submissionSuccess = true;

            // Reset submit button state
            if (submitBtn) {
              submitBtn.disabled = false;
              const spinner = submitBtn.querySelector('.btn-spinner');
              if (spinner) spinner.classList.add('hidden');
            }

            // Fire Primary Conversion Event ONLY upon successful backend processing
            Analytics.track('lead_submit', {
              form_type: formType,
              lead_name: payload.name,
              lead_phone: payload.phone,
              lead_email: payload.email,
              budget: payload.budget,
              location: payload.location,
              property_type: payload.property_type,
              looking_for: payload.looking_for,
              utm_source: payload.utm_source,
              utm_campaign: payload.utm_campaign
            });

            // Fire budget-specific conversion event
            if (budget.includes('Under ₹3 Cr')) {
              Analytics.track('budget_under_3cr', { source: 'form_submit' });
            } else if (budget.includes('5–10')) {
              Analytics.track('budget_5_10cr', { source: 'form_submit' });
            } else if (budget.includes('10 Cr+')) {
              Analytics.track('budget_10cr_plus', { source: 'form_submit' });
            }

            form.reset();

            // If submitted from Hero Form, Main Form, or Exit Intent, show the clean modal Thank You state
            if (form.id !== 'modal-lead-form') {
              Modal.openLeadModal();
            }
            Modal.showSuccess();
            break;
          }
        } catch (endpointErr) {
          console.warn(`[Endpoint ${endpoint} unreachable, trying fallback...]`, endpointErr);
        }
      }

      if (!submissionSuccess) {
        if (submitBtn) {
          submitBtn.disabled = false;
          const spinner = submitBtn.querySelector('.btn-spinner');
          if (spinner) spinner.classList.add('hidden');
        }
        if (alertBox) {
          alertBox.classList.remove('hidden');
        }
      }
    });
  });

  // ==========================================================================
  // 7. DESKTOP EXIT-INTENT POPUP TRIGGER
  // ==========================================================================
  let exitIntentFired = false;
  const exitModal = document.getElementById('exit-intent-modal');

  function initExitIntent() {
    // Show the modal shortly after page load (or refresh)
    setTimeout(() => {
      // Don't trigger if regular lead modal is already open
      const leadModal = document.getElementById('lead-modal');
      if (leadModal && leadModal.classList.contains('is-active')) return;

      if (exitModal && !exitIntentFired) {
        exitIntentFired = true;
        exitModal.classList.add('is-active');
        exitModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        Analytics.track('popup_open', {
          popup_type: 'on_load_popup'
        });
      }
    }, 1500); // 1.5 second delay before showing
  }

  initExitIntent();

  // ==========================================================================
  // 8. MOBILE STICKY CTA OBSERVER
  // ==========================================================================
  const mobileStickyBar = document.getElementById('mobile-sticky-bar');
  const heroFormContainer = document.getElementById('hero-lead-form-container');

  if (mobileStickyBar && heroFormContainer) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (window.innerWidth <= 768) {
          // If hero form is currently visible, gently slide sticky bar down to prevent clutter
          if (entry.isIntersecting) {
            mobileStickyBar.style.transform = 'translateY(100%)';
          } else {
            mobileStickyBar.style.transform = 'translateY(0)';
          }
        }
      });
    }, { threshold: 0.2 });

    observer.observe(heroFormContainer);
  }

})();
