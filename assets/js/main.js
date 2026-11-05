const applyButton = document.getElementById('show-application');
const applicationForm = document.getElementById('application-form');
const formMessage = document.getElementById('form-message');
const currentYear = document.getElementById('current-year');
const phoneInput = document.getElementById('phone');
const employmentStatus = document.getElementById('employment-status');
const employerInput = document.getElementById('employer');
const employerLabel = document.querySelector('label[for="employer"]');
const steps = [...document.querySelectorAll('.form-step')];
const stepTitle = document.getElementById('step-title');
const stepCount = document.getElementById('step-count');
const progressBar = document.querySelector('.progress-track');
const progressValue = document.getElementById('progress-value');
const previousButton = document.getElementById('previous-step');
const nextButton = document.getElementById('next-step');
const submitButton = document.getElementById('submit-application');
const reviewList = document.getElementById('application-review');
const successPanel = document.getElementById('success-panel');
let currentStep = 0;

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

function updateEmploymentRequirements() {
  if (!employmentStatus || !employerInput) return;
  const isEmployed = ['employed', 'self-employed'].includes(employmentStatus.value);
  employerInput.required = isEmployed;
  employerInput.disabled = !isEmployed;
  employerInput.value = isEmployed ? employerInput.value : '';
  employerLabel.hidden = !isEmployed;
}

function setStep(stepIndex) {
  currentStep = stepIndex;
  steps.forEach((step, index) => {
    step.hidden = index !== currentStep;
    step.disabled = index !== currentStep;
  });

  const stepNames = ['Personal details', 'Employment details', 'Loan details', 'Review and submit'];
  stepTitle.textContent = stepNames[currentStep];
  stepCount.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  progressValue.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  progressBar.setAttribute('aria-valuenow', String(currentStep + 1));
  previousButton.hidden = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  formMessage.textContent = '';

  if (currentStep === steps.length - 1) {
    renderReview();
  }
}

function validateCurrentStep() {
  const fields = [...steps[currentStep].querySelectorAll('input, select, textarea')];
  const invalidField = fields.find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    invalidField.focus();
    return false;
  }
  return true;
}

function readFormValue(name) {
  return applicationForm.elements.namedItem(name)?.value?.toString().trim() ?? '';
}

function renderReview() {
  const entries = [
    ['Full name', readFormValue('fullName')],
    ['Phone', readFormValue('phone')],
    ['Email', readFormValue('email')],
    ['Country', readFormValue('country')],
    ['Address', readFormValue('address')],
    ['Employment status', readFormValue('employmentStatus')],
    ['Employer/business', readFormValue('employer') || 'Not provided'],
    ['Monthly income (USD)', readFormValue('monthlyIncome')],
    ['Employment duration', readFormValue('employmentDuration')],
    ['Requested amount (USD)', readFormValue('requestedAmount')],
    ['Purpose', readFormValue('loanPurpose')],
    ['Preferred period', `${readFormValue('repaymentMonths')} months`],
  ];

  reviewList.replaceChildren();
  entries.forEach(([label, value]) => {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    reviewList.append(term, description);
  });
}

function createLocalReference() {
  const randomPart = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().replaceAll('-', '').slice(0, 10)
    : Array.from(crypto.getRandomValues(new Uint8Array(5)), (byte) =>
        byte.toString(16).padStart(2, '0')).join('');
  return `LOCAL-${randomPart.toUpperCase()}`;
}

function showError(message) {
  formMessage.textContent = message;
  formMessage.setAttribute('role', 'alert');
}

if (applyButton && applicationForm) {
  applyButton.addEventListener('click', () => {
    const isExpanded = applyButton.getAttribute('aria-expanded') === 'true';
    applyButton.setAttribute('aria-expanded', String(!isExpanded));
    applicationForm.hidden = isExpanded;

    if (!isExpanded) {
      setStep(0);
      applicationForm.querySelector('input')?.focus();
    }
  });

  employmentStatus?.addEventListener('change', updateEmploymentRequirements);
  updateEmploymentRequirements();

  nextButton.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    setStep(Math.min(currentStep + 1, steps.length - 1));
  });

  previousButton.addEventListener('click', () => {
    setStep(Math.max(currentStep - 1, 0));
  });

  applicationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formMessage.textContent = '';
    formMessage.removeAttribute('role');

    if (!validateCurrentStep()) return;

    const application = {
      reference: createLocalReference(),
      savedAt: new Date().toISOString(),
    };
    applicationForm.querySelectorAll('input, select, textarea').forEach((field) => {
      if (field.name && field.type !== 'checkbox') application[field.name] = field.value.trim();
    });
    submitButton.disabled = true;
    submitButton.textContent = 'Saving preview…';

    try {
      const savedApplications = JSON.parse(localStorage.getItem('ecocashTimLoanPreviews') || '[]');
      if (!Array.isArray(savedApplications)) {
        throw new Error('Stored application data is invalid. Clear this site’s local storage and try again.');
      }
      savedApplications.push(application);
      localStorage.setItem('ecocashTimLoanPreviews', JSON.stringify(savedApplications));

      applicationForm.querySelectorAll('.form-step, .form-actions, .privacy-note').forEach((element) => {
        element.hidden = true;
      });
      document.getElementById('application-reference').textContent = application.reference;
      successPanel.hidden = false;
      successPanel.focus();
    } catch (error) {
      showError(error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'This browser cannot save more data. Clear this site’s storage and try again.'
        : error instanceof Error ? error.message : 'Could not save this preview in this browser.');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit application';
    }
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
