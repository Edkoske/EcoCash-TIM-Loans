const applyButton = document.getElementById('show-application');
const applicationForm = document.getElementById('application-form');
const formMessage = document.getElementById('form-message');
const currentYear = document.getElementById('current-year');
const phoneInput = document.getElementById('phone');

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if (applyButton && applicationForm) {
  applyButton.addEventListener('click', () => {
    const isExpanded = applyButton.getAttribute('aria-expanded') === 'true';
    applyButton.setAttribute('aria-expanded', String(!isExpanded));
    applicationForm.hidden = isExpanded;

    if (!isExpanded) {
      applicationForm.querySelector('input')?.focus();
    }
  });

  applicationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formMessage.textContent = '';

    if (!applicationForm.reportValidity()) {
      return;
    }

    formMessage.textContent =
      'Preview only: your details were not sent or saved. Call 0740 613560 to continue.';
  });
}

if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    const phoneIsValid = /^[+0-9()\s-]{7,20}$/.test(phoneInput.value);
    phoneInput.setCustomValidity(
      phoneInput.value && !phoneIsValid ? 'Enter a valid phone number.' : '',
    );
  });
}
