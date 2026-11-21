document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Dark / Light Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = themeToggle ? themeToggle.querySelector('.theme-label') : null;
  const savedTheme = localStorage.getItem('st-theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    if (themeLabel) themeLabel.textContent = 'Light';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('st-theme', isDark ? 'dark' : 'light');
      if (themeLabel) themeLabel.textContent = isDark ? 'Light' : 'Dark';
    });
  }

  // 3. Mobile Navigation Drawer
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
// Auto-open modal when arriving via ?service=... link
    const urlParams = new URLSearchParams(window.location.search);
    const requestedService = urlParams.get('service');
    if (requestedService) {
      openServiceModal(requestedService);
    }
  // 4. Scroll Reveal
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(el => observer.observe(el));

  // 5. Two-Step Service Request Modal
  const serviceModal = document.getElementById('serviceModal');
  const closeServiceBtn = document.getElementById('closeServiceModal');
  const doneServiceBtn = document.getElementById('doneServiceBtn');
  const backToServicesBtn = document.getElementById('backToServicesBtn');
  const step1View = document.getElementById('serviceStep1');
  const step2View = document.getElementById('serviceStep2');
  const step3View = document.getElementById('serviceStep3');
  const chosenServiceTitle = document.getElementById('chosenServiceTitle');
  const chosenServiceInput = document.getElementById('chosenServiceInput');
  const serviceForm = document.getElementById('serviceRequestForm');
  const messageTextarea = document.getElementById('clientMessage');
  const submitServiceBtn = document.getElementById('submitServiceBtn');
  const serviceErrorBox = document.getElementById('serviceError');
  const confirmedServiceName = document.getElementById('confirmedServiceName');
  const confirmedEmailEl = document.getElementById('confirmedEmail');

  const servicePlaceholders = {
    'GIS Spatial Analysis & Cartography': 'Tell us about your study area, required map outputs, data sources, or deadline...',
    'Cadastral & Engineering Surveying': 'Describe the site location, survey type (subdivision, setting-out, topo), or CAD deliverables needed...',
    'QGIS Tutoring & Geospatial Training': 'Let us know your current GIS experience level and which topics or cohort you want to join...',
    'Custom Portfolio Website': 'Share your profession, the projects or work samples you want to showcase, and any timeline goals...',
    'General Geospatial Consultation': 'Share more details about your project, challenge, or enquiry...'
  };

  if (serviceModal && serviceForm) {
    const showStep1 = () => {
      step1View.style.display = 'block';
      step2View.style.display = 'none';
      step3View.style.display = 'none';
      serviceErrorBox.style.display = 'none';
    };

    const showStep2 = (serviceName) => {
      chosenServiceTitle.textContent = serviceName;
      chosenServiceInput.value = serviceName;
      messageTextarea.placeholder = servicePlaceholders[serviceName] || 'Share more details about your project or enquiry...';
      step1View.style.display = 'none';
      step2View.style.display = 'block';
      step3View.style.display = 'none';
      serviceErrorBox.style.display = 'none';
    };

    const openServiceModal = (preselectedService) => {
      if (preselectedService) {
        showStep2(preselectedService);
      } else {
        showStep1();
      }
      serviceModal.classList.add('open');
      serviceModal.setAttribute('aria-hidden', 'false');
    };

    const closeServiceModal = () => {
      serviceModal.classList.remove('open');
      serviceModal.setAttribute('aria-hidden', 'true');
    };

    document.querySelectorAll('[data-open-service]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const preset = trigger.getAttribute('data-open-service');
        openServiceModal(preset || null);
      });
    });

    document.querySelectorAll('[data-select-service]').forEach(optionBtn => {
      optionBtn.addEventListener('click', () => {
        const chosen = optionBtn.getAttribute('data-select-service');
        showStep2(chosen);
      });
    });

    if (backToServicesBtn) backToServicesBtn.addEventListener('click', showStep1);
    if (closeServiceBtn) closeServiceBtn.addEventListener('click', closeServiceModal);
    if (doneServiceBtn) doneServiceBtn.addEventListener('click', closeServiceModal);

    serviceModal.addEventListener('click', (e) => {
      if (e.target === serviceModal) closeServiceModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && serviceModal.classList.contains('open')) closeServiceModal();
    });

    serviceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      serviceErrorBox.style.display = 'none';

      const service = chosenServiceInput.value;
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone').value.trim() || 'Not provided';
      const message = messageTextarea.value.trim();

      submitServiceBtn.disabled = true;
      submitServiceBtn.textContent = 'Submitting Request...';

      try {
        const response = await fetch('https://formsubmit.co/ajax/madhinganettey@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            Service: service,
            Email: email,
            Phone: phone,
            Enquiry: message,
            _subject: 'SpatialTech Zimbabwe Enquiry: ' + service,
            _template: 'table'
          })
        });

        if (!response.ok) throw new Error('Submission failed');

        confirmedServiceName.textContent = service;
        confirmedEmailEl.textContent = email;
        serviceForm.reset();
        step2View.style.display = 'none';
        step3View.style.display = 'block';
      } catch (err) {
        serviceErrorBox.innerHTML = 'Could not send automatically right now. Please <a href="mailto:madhinganettey@gmail.com?subject=' +
          encodeURIComponent('SpatialTech Service Request: ' + service) + '&body=' +
          encodeURIComponent('Service: ' + service + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\nDetails:\n' + message) +
          '" style="color: inherit; text-decoration: underline;">click here to send via email</a> or message +263 77 678 9729 on WhatsApp.';
        serviceErrorBox.style.display = 'block';
      } finally {
        submitServiceBtn.disabled = false;
        submitServiceBtn.textContent = 'Submit Request →';
      }
    });
  }
});