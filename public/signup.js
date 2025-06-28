// Patient Signup Page JavaScript
class PatientSignup {
    constructor() {
        this.form = document.getElementById('patientForm');
        this.captureBtn = document.getElementById('captureFingerprint');
        this.clearBtn = document.getElementById('clearFingerprint');
        this.submitBtn = document.querySelector('button[type="submit"]');
        this.notification = document.getElementById('notification');
        
        this.fingerprintData = null;
        this.isFormValid = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Fingerprint capture
        this.captureBtn.addEventListener('click', () => this.captureFingerprint());
        this.clearBtn.addEventListener('click', () => this.clearFingerprint());
        
        // Form field changes
        this.form.addEventListener('input', () => this.validateForm());
        this.form.addEventListener('change', () => this.validateForm());
        
        // Fingerprint sensor events
        document.addEventListener('fingerprintCaptured', (e) => this.onFingerprintCaptured(e.detail));
        document.addEventListener('fingerprintError', (e) => this.onFingerprintError(e.detail));
    }

    setupFormValidation() {
        // Real-time validation
        const requiredFields = ['name', 'age', 'gender', 'bloodGroup'];
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.validateField(field));
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('error');
        this.removeFieldError(fieldName);

        // Validation rules
        switch (fieldName) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
                
            case 'age':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Age is required';
                } else if (isNaN(value) || value < 1 || value > 120) {
                    isValid = false;
                    errorMessage = 'Age must be between 1 and 120';
                }
                break;
                
            case 'gender':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Gender is required';
                }
                break;
                
            case 'bloodGroup':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Blood group is required';
                }
                break;
        }

        // Apply validation result
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(fieldName, errorMessage);
        }

        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        if (field) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.id = `${fieldName}-error`;
            errorDiv.textContent = message;
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.9rem';
            errorDiv.style.marginTop = '5px';
            
            field.parentNode.appendChild(errorDiv);
        }
    }

    removeFieldError(fieldName) {
        const errorDiv = document.getElementById(`${fieldName}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        const requiredFields = ['name', 'age', 'gender', 'bloodGroup'];
        let isValid = true;

        // Validate all required fields
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Check if fingerprint is captured
        if (!this.fingerprintData) {
            isValid = false;
        }

        // Update submit button state
        this.submitBtn.disabled = !isValid;
        this.isFormValid = isValid;

        return isValid;
    }

    async captureFingerprint() {
        try {
            this.captureBtn.disabled = true;
            this.captureBtn.textContent = '📱 Capturing...';
            
            const success = await window.fingerprintSensor.captureFingerprint();
            
            if (!success) {
                this.showNotification('Failed to capture fingerprint. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error capturing fingerprint:', error);
            this.showNotification('Error capturing fingerprint: ' + error.message, 'error');
        } finally {
            this.captureBtn.disabled = false;
            this.captureBtn.textContent = '📱 Capture Fingerprint';
        }
    }

    clearFingerprint() {
        window.fingerprintSensor.clearFingerprint();
        this.fingerprintData = null;
        this.validateForm();
    }

    onFingerprintCaptured(fingerprintData) {
        this.fingerprintData = fingerprintData;
        this.validateForm();
        this.showNotification('Fingerprint captured successfully!', 'success');
    }

    onFingerprintError(error) {
        this.fingerprintData = null;
        this.validateForm();
        this.showNotification('Fingerprint capture failed: ' + error, 'error');
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        if (!this.isFormValid) {
            this.showNotification('Please fill all required fields and capture fingerprint.', 'error');
            return;
        }

        try {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = '⏳ Registering...';

            const formData = new FormData(this.form);
            formData.append('fingerprintData', this.fingerprintData);

            const response = await fetch('/api/patients', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Patient registered successfully!', 'success');
                this.resetForm();
            } else {
                this.showNotification('Registration failed: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = '✅ Register Patient';
        }
    }

    resetForm() {
        this.form.reset();
        this.clearFingerprint();
        this.fingerprintData = null;
        this.isFormValid = false;
        this.validateForm();
        
        // Remove all error styling
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        // Remove all error messages
        const errorMessages = this.form.querySelectorAll('.field-error');
        errorMessages.forEach(msg => msg.remove());
    }

    showNotification(message, type = 'info') {
        if (this.notification) {
            this.notification.textContent = message;
            this.notification.className = `notification ${type}`;
            this.notification.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.notification.style.display = 'none';
            }, 5000);
        } else {
            // Fallback alert
            alert(message);
        }
    }

    // Utility method to format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize the signup page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PatientSignup();
});

// Add some CSS for form validation
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
    
    .field-error {
        color: #e74c3c;
        font-size: 0.9rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style); 