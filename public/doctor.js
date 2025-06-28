// Doctor Dashboard JavaScript
class DoctorDashboard {
    constructor() {
        this.scanBtn = document.getElementById('scanFingerprint');
        this.clearBtn = document.getElementById('clearScan');
        this.notification = document.getElementById('notification');
        this.recentPatientsList = document.getElementById('recentPatientsList');
        
        this.currentPatient = null;
        this.recentPatients = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecentPatients();
    }

    setupEventListeners() {
        // Fingerprint scanning
        this.scanBtn.addEventListener('click', () => this.scanFingerprint());
        this.clearBtn.addEventListener('click', () => this.clearScan());
        
        // Fingerprint sensor events
        document.addEventListener('fingerprintCaptured', (e) => this.onFingerprintCaptured(e.detail));
        document.addEventListener('fingerprintError', (e) => this.onFingerprintError(e.detail));
    }

    async scanFingerprint() {
        try {
            this.scanBtn.disabled = true;
            this.scanBtn.textContent = '📱 Scanning...';
            
            const success = await window.fingerprintSensor.captureFingerprint();
            
            if (!success) {
                this.showNotification('Failed to scan fingerprint. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error scanning fingerprint:', error);
            this.showNotification('Error scanning fingerprint: ' + error.message, 'error');
        } finally {
            this.scanBtn.disabled = false;
            this.scanBtn.textContent = '📱 Scan Fingerprint';
        }
    }

    clearScan() {
        window.fingerprintSensor.clearFingerprint();
        this.hidePatientInfo();
        this.showScanPrompt();
    }

    onFingerprintCaptured(fingerprintData) {
        this.searchPatient(fingerprintData);
    }

    onFingerprintError(error) {
        this.showNotification('Fingerprint scan failed: ' + error, 'error');
    }

    async searchPatient(fingerprintData) {
        try {
            this.showNotification('Searching for patient...', 'info');
            
            const response = await fetch('/api/patients/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fingerprintData })
            });

            const result = await response.json();

            if (result.success && result.patient) {
                this.currentPatient = result.patient;
                this.displayPatientInfo(result.patient);
                this.showNotification('Patient found!', 'success');
            } else {
                this.showNoPatientFound();
                this.showNotification('Patient not found in database.', 'error');
            }
        } catch (error) {
            console.error('Error searching for patient:', error);
            this.showNotification('Error searching for patient. Please try again.', 'error');
        }
    }

    displayPatientInfo(patient) {
        // Hide scan prompt and no patient found sections
        this.hideScanPrompt();
        this.hideNoPatientFound();
        
        // Show patient info section
        const patientInfo = document.getElementById('patientInfo');
        if (patientInfo) {
            patientInfo.style.display = 'block';
        }

        // Update patient information
        this.updatePatientDetails(patient);
    }

    updatePatientDetails(patient) {
        // Update patient name
        const nameElement = document.getElementById('patientName');
        if (nameElement) {
            nameElement.textContent = patient.name;
        }

        // Update patient ID
        const idElement = document.getElementById('patientId');
        if (idElement) {
            idElement.textContent = `ID: #${patient._id.slice(-6).toUpperCase()}`;
        }

        // Update patient details
        const ageElement = document.getElementById('patientAge');
        if (ageElement) {
            ageElement.textContent = patient.age;
        }

        const genderElement = document.getElementById('patientGender');
        if (genderElement) {
            genderElement.textContent = patient.gender;
        }

        const bloodGroupElement = document.getElementById('patientBloodGroup');
        if (bloodGroupElement) {
            bloodGroupElement.textContent = patient.bloodGroup;
        }

        const dateElement = document.getElementById('patientDate');
        if (dateElement) {
            dateElement.textContent = this.formatDate(patient.createdAt);
        }
    }

    showNoPatientFound() {
        // Hide scan prompt and patient info
        this.hideScanPrompt();
        this.hidePatientInfo();
        
        // Show no patient found section
        const noPatientFound = document.getElementById('noPatientFound');
        if (noPatientFound) {
            noPatientFound.style.display = 'block';
        }
    }

    hidePatientInfo() {
        const patientInfo = document.getElementById('patientInfo');
        if (patientInfo) {
            patientInfo.style.display = 'none';
        }
    }

    hideNoPatientFound() {
        const noPatientFound = document.getElementById('noPatientFound');
        if (noPatientFound) {
            noPatientFound.style.display = 'none';
        }
    }

    hideScanPrompt() {
        const scanPrompt = document.getElementById('scanPrompt');
        if (scanPrompt) {
            scanPrompt.style.display = 'none';
        }
    }

    showScanPrompt() {
        // Hide other sections
        this.hidePatientInfo();
        this.hideNoPatientFound();
        
        // Show scan prompt
        const scanPrompt = document.getElementById('scanPrompt');
        if (scanPrompt) {
            scanPrompt.style.display = 'block';
        }
    }

    async loadRecentPatients() {
        try {
            const response = await fetch('/api/patients');
            const result = await response.json();

            if (result.success) {
                this.recentPatients = result.patients.slice(0, 6); // Show last 6 patients
                this.displayRecentPatients();
            }
        } catch (error) {
            console.error('Error loading recent patients:', error);
        }
    }

    displayRecentPatients() {
        if (!this.recentPatientsList) return;

        if (this.recentPatients.length === 0) {
            this.recentPatientsList.innerHTML = `
                <div class="no-patients">
                    <p>No patients registered yet.</p>
                    <a href="/signup" class="btn btn-primary">Register First Patient</a>
                </div>
            `;
            return;
        }

        const patientsHTML = this.recentPatients.map(patient => `
            <div class="patient-item" onclick="doctorDashboard.selectPatient('${patient._id}')">
                <h4>${patient.name}</h4>
                <p><strong>Age:</strong> ${patient.age} | <strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>
                <p><strong>Registered:</strong> ${this.formatDate(patient.createdAt)}</p>
            </div>
        `).join('');

        this.recentPatientsList.innerHTML = patientsHTML;
    }

    async selectPatient(patientId) {
        try {
            const response = await fetch(`/api/patients/${patientId}`);
            const result = await response.json();

            if (result.success && result.patient) {
                this.currentPatient = result.patient;
                this.displayPatientInfo(result.patient);
                this.showNotification('Patient selected from recent list.', 'info');
            }
        } catch (error) {
            console.error('Error selecting patient:', error);
            this.showNotification('Error selecting patient.', 'error');
        }
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Method to refresh recent patients list
    refreshRecentPatients() {
        this.loadRecentPatients();
    }

    // Method to get current patient
    getCurrentPatient() {
        return this.currentPatient;
    }

    // Method to clear current patient
    clearCurrentPatient() {
        this.currentPatient = null;
        this.clearScan();
    }
}

// Global instance for access from HTML
let doctorDashboard;

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    doctorDashboard = new DoctorDashboard();
});

// Add some CSS for patient items
const style = document.createElement('style');
style.textContent = `
    .patient-item {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .patient-item:hover {
        background: #e9ecef !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .no-patients {
        text-align: center;
        padding: 40px 20px;
        color: #7f8c8d;
    }
    
    .no-patients p {
        margin-bottom: 20px;
        font-size: 1.1rem;
    }
    
    .patient-actions .btn {
        margin: 5px;
    }
    
    @media (max-width: 768px) {
        .patient-actions {
            flex-direction: column;
        }
        
        .patient-actions .btn {
            margin: 5px 0;
        }
    }
`;
document.head.appendChild(style); 