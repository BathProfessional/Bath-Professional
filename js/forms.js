/* Form submissions → support@bathprofessional.com via FormSubmit */
(function () {
  'use strict';

  const FORM_EMAIL = 'support@bathprofessional.com';
  const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_EMAIL}`;

  function isFileProtocol() {
    return window.location.protocol === 'file:';
  }

  async function sendToSupport(payload) {
    if (isFileProtocol()) {
      throw new Error(
        'Forms must be opened through a web server (not as a saved HTML file). Use http://localhost:8080 locally, or upload the site to your web host.'
      );
    }

    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      throw new Error('Unexpected response from the form service.');
    }

    if (data.success === 'true' || data.success === true) {
      return data;
    }

    throw new Error(data.message || 'Submission failed. Please try again or contact us by phone.');
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden', 'success', 'error', 'pending');
    el.classList.add(type);
  }

  function friendlyError(err) {
    const msg = err?.message || '';
    if (msg.includes('Activation')) {
      return 'Almost ready! Check support@bathprofessional.com for a FormSubmit activation email and click the link once. After that, online forms will work on localhost and your live website.';
    }
    if (msg.includes('web server')) {
      return msg;
    }
    return msg || 'Could not send online. Please call (888) 828-3691 or email support@bathprofessional.com directly.';
  }

  function labelValue(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.tagName === 'SELECT') {
      return el.options[el.selectedIndex]?.text || el.value;
    }
    return el.value.trim();
  }

  // Show success if redirected back after standard form post
  if (window.location.search.includes('sent=1')) {
    const contactStatus = document.getElementById('contactFormStatus');
    setStatus(contactStatus, 'Thank you! Your message was sent. We\'ll reply shortly.', 'success');
    contactStatus?.classList.remove('hidden');
    history.replaceState(null, '', window.location.pathname + window.location.hash);
  }

  // ─── Contact form (#contact) ───
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactFormStatus');
  const contactBtn = document.getElementById('contactSubmitBtn');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('cfName')?.value.trim();
    const email = document.getElementById('cfEmail')?.value.trim();
    const phone = document.getElementById('cfPhone')?.value.trim();
    const message = document.getElementById('cfMessage')?.value.trim();

    if (!name || !email || !phone || !message) {
      setStatus(contactStatus, 'Please fill in all fields.', 'error');
      contactStatus?.classList.remove('hidden');
      return;
    }

    contactBtn.disabled = true;
    setStatus(contactStatus, 'Sending your message…', 'pending');
    contactStatus?.classList.remove('hidden');

    try {
      await sendToSupport({
        _subject: 'New Contact Message — Bath Professional Website',
        _template: 'table',
        _captcha: 'false',
        name,
        email,
        phone,
        message,
      });

      contactForm.reset();
      setStatus(contactStatus, 'Thank you! Your message was sent to our team. We\'ll reply shortly.', 'success');
    } catch (err) {
      setStatus(contactStatus, friendlyError(err), 'error');
    } finally {
      contactBtn.disabled = false;
    }
  });

  // ─── Estimate confirmation (quote form) ───
  const confirmBtn = document.getElementById('confirmEstimateBtn');
  const quoteStatus = document.getElementById('quoteFormStatus');

  confirmBtn?.addEventListener('click', async () => {
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim();

    if (!name || !email || !phone) {
      setStatus(quoteStatus, 'Please enter your name, email, and phone in the estimate form.', 'error');
      quoteStatus?.classList.remove('hidden');
      document.getElementById('quoteForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const selectedDay = document.querySelector('#calendarGrid .calendar-day.selected');
    const preferredDate = selectedDay
      ? `${selectedDay.textContent} (selected on calendar)`
      : 'Not selected';

    confirmBtn.disabled = true;
    setStatus(quoteStatus, 'Submitting your FREE estimate request…', 'pending');
    quoteStatus?.classList.remove('hidden');

    try {
      await sendToSupport({
        _subject: 'FREE Estimate Request — Bath Professional Website',
        _template: 'table',
        _captcha: 'false',
        name,
        email,
        phone,
        service: labelValue('serviceType'),
        surface_material: labelValue('surfaceType'),
        condition: labelValue('condition'),
        desired_color: labelValue('finish'),
        zip_code: document.getElementById('zipCode')?.value.trim() || '',
        estimated_price: document.getElementById('priceAmount')?.textContent || '',
        estimated_timeline: document.getElementById('timelineDays')?.textContent || '',
        preferred_date: preferredDate,
        message: 'Customer confirmed their FREE on-site estimate via the website quote tool.',
      });

      setStatus(quoteStatus, 'Request sent! Our team will contact you soon at the email or phone you provided.', 'success');
    } catch (err) {
      setStatus(quoteStatus, friendlyError(err), 'error');
    } finally {
      confirmBtn.disabled = false;
    }
  });
})();