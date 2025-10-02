/* ============= Capital Page Form Handling ============= */
(function() {
  const form = document.getElementById('capital-intake');
  if (!form) return;

  // Form validation and submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) return;
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    try {
      // Try to submit to API endpoint first
      const response = await fetch('/functions/v1/capital-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showSuccessMessage();
        form.reset();
      } else {
        throw new Error('API submission failed');
      }
    } catch (error) {
      // Fallback to mailto
      console.log('API not available, using mailto fallback');
      const mailtoUrl = createMailtoUrl(data);
      window.location.href = mailtoUrl;
    } finally {
      // Reset button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
  
  // Form validation
  function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['name', 'email', 'accredited', 'no-offer'];
    
    requiredFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;
      
      if (field.type === 'checkbox') {
        if (!field.checked) {
          showFieldError(field, 'This field is required');
          isValid = false;
        }
      } else {
        if (!field.value.trim()) {
          showFieldError(field, 'This field is required');
          isValid = false;
        }
      }
    });
    
    // Email validation
    const emailField = form.querySelector('[name="email"]');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  // Show field error
  function showFieldError(field, message) {
    const formGroup = field.closest('.form-group') || field.closest('.checkbox-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  }
  
  // Clear all errors
  function clearErrors() {
    const errorGroups = form.querySelectorAll('.form-group.error, .checkbox-group.error');
    errorGroups.forEach(group => {
      group.classList.remove('error');
      const errorMessage = group.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    });
  }
  
  // Create mailto URL
  function createMailtoUrl(data) {
    const subject = 'Capital Inquiry';
    const body = `Name: ${data.name}
Email: ${data.email}
Firm: ${data.firm || 'Not provided'}
Accredited Investor: ${data.accredited ? 'Yes' : 'No'}
Understands not an offer: ${data['no-offer'] ? 'Yes' : 'No'}

Please provide additional details about capital partnership opportunities.`;
    
    return `mailto:capital@cgdefenseconsulting.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  
  // Show success message
  function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <div style="
        background: var(--accent-2);
        color: white;
        padding: var(--gap-3);
        border-radius: var(--r-sm);
        margin-top: var(--gap-3);
        text-align: center;
        font-weight: 500;
      ">
        Thank you for your interest! We'll be in touch soon.
      </div>
    `;
    
    form.appendChild(successMessage);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.remove();
      }
    }, 5000);
  }
  
  // Real-time validation
  const inputs = form.querySelectorAll('input[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (input.type === 'checkbox') {
        const formGroup = input.closest('.checkbox-group');
        if (formGroup) {
          formGroup.classList.remove('error');
          const errorMessage = formGroup.querySelector('.error-message');
          if (errorMessage) {
            errorMessage.remove();
          }
        }
      } else {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
          formGroup.classList.remove('error');
          const errorMessage = formGroup.querySelector('.error-message');
          if (errorMessage) {
            errorMessage.remove();
          }
        }
      }
    });
  });
})();


