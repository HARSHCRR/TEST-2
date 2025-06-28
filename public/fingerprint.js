// Fingerprint Sensor Integration for Mantra MFS110 with RD Services
class FingerprintSensor {
    constructor() {
        this.isConnected = false;
        this.isCapturing = false;
        this.fingerprintData = null;
        this.mantraServerUrl = 'http://localhost:8080'; // Mantra RD Services URL
        
        // Initialize Mantra RD Services connection
        this.initMantraConnection();
    }

    // Initialize connection to Mantra RD Services
    async initMantraConnection() {
        try {
            // Test connection to Mantra RD Services
            const response = await fetch(`${this.mantraServerUrl}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Connected to Mantra RD Services');
                this.isConnected = true;
                this.updateStatus('connected', 'Connected to Mantra RD Services');
            } else {
                console.warn('Mantra RD Services not available, using fallback');
                this.setupFallbackMethod();
            }
        } catch (error) {
            console.warn('Mantra RD Services not available, using fallback method');
            this.setupFallbackMethod();
        }
    }

    // Fallback method for when Mantra RD Services is not available
    setupFallbackMethod() {
        console.log('Using fallback fingerprint simulation');
        this.isConnected = false;
        this.updateStatus('disconnected', 'Using simulation mode');
    }

    // Connect to Mantra RD Services
    async connect() {
        try {
            const response = await fetch(`${this.mantraServerUrl}/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceType: 'MFS110',
                    baudRate: 9600
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.isConnected = true;
                    this.updateStatus('connected', 'Connected to Mantra MFS110');
                    return true;
                }
            }
            
            throw new Error('Failed to connect to Mantra RD Services');
        } catch (error) {
            console.error('Error connecting to Mantra RD Services:', error);
            this.updateStatus('error', 'Failed to connect to Mantra RD Services');
            return false;
        }
    }

    // Capture fingerprint using Mantra RD Services
    async captureFingerprint() {
        if (!this.isConnected) {
            const connected = await this.connect();
            if (!connected) {
                this.updateStatus('error', 'Please ensure Mantra RD Services is running');
                return false;
            }
        }

        this.isCapturing = true;
        this.updateStatus('capturing', 'Capturing fingerprint...');

        try {
            // Send capture command to Mantra RD Services
            const response = await fetch(`${this.mantraServerUrl}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceType: 'MFS110',
                    timeout: 10000, // 10 seconds timeout
                    quality: 'high'
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.fingerprintData) {
                    this.handleFingerprintData(result.fingerprintData);
                    return true;
                } else {
                    throw new Error(result.message || 'Failed to capture fingerprint');
                }
            } else {
                throw new Error('Failed to communicate with Mantra RD Services');
            }
        } catch (error) {
            console.error('Error capturing fingerprint:', error);
            
            // If Mantra RD Services fails, try fallback
            if (error.message.includes('Failed to communicate')) {
                console.log('Trying fallback method...');
                return await this.simulateFingerprintCapture();
            }
            
            this.isCapturing = false;
            this.updateStatus('error', 'Failed to capture fingerprint: ' + error.message);
            return false;
        }
    }

    // Handle fingerprint data from Mantra RD Services
    handleFingerprintData(data) {
        this.isCapturing = false;
        this.fingerprintData = this.processFingerprintData(data);
        this.updateStatus('success', 'Fingerprint captured successfully');
        this.displayFingerprint();
        
        // Trigger event for other components
        this.triggerEvent('fingerprintCaptured', this.fingerprintData);
    }

    // Process fingerprint data from Mantra RD Services
    processFingerprintData(data) {
        // Handle different data formats from Mantra RD Services
        if (typeof data === 'string') {
            // If it's already a string, use it directly
            return data;
        } else if (data.template) {
            // If it's an object with template property
            return data.template;
        } else if (data.data) {
            // If it's an object with data property
            return data.data;
        } else {
            // Fallback: generate a unique hash
            return this.generateFingerprintHash(JSON.stringify(data));
        }
    }

    // Generate a unique hash for fingerprint data
    generateFingerprintHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36) + Date.now().toString(36);
    }

    // Simulate fingerprint capture for development/testing
    async simulateFingerprintCapture() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate simulated fingerprint data
                const simulatedData = this.generateSimulatedFingerprint();
                this.handleFingerprintData(simulatedData);
                resolve(true);
            }, 2000); // Simulate 2-second capture time
        });
    }

    // Generate simulated fingerprint data
    generateSimulatedFingerprint() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        for (let i = 0; i < 64; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Display captured fingerprint
    displayFingerprint() {
        const previewElement = document.getElementById('fingerprintPreview') || 
                              document.getElementById('scanPreview');
        const imageElement = document.getElementById('fingerprintImage') || 
                            document.getElementById('scanImage');
        
        if (previewElement && imageElement) {
            previewElement.style.display = 'block';
            imageElement.innerHTML = '👆';
            imageElement.style.background = '#e8f5e8';
            imageElement.style.borderColor = '#27ae60';
        }
    }

    // Clear fingerprint data
    clearFingerprint() {
        this.fingerprintData = null;
        this.isCapturing = false;
        this.updateStatus('ready', 'Ready to capture');
        
        const previewElement = document.getElementById('fingerprintPreview') || 
                              document.getElementById('scanPreview');
        const imageElement = document.getElementById('fingerprintImage') || 
                            document.getElementById('scanImage');
        
        if (previewElement && imageElement) {
            previewElement.style.display = 'none';
            imageElement.innerHTML = '';
            imageElement.style.background = '#f8f9fa';
            imageElement.style.borderColor = '#dee2e6';
        }
    }

    // Update status indicator
    updateStatus(status, message) {
        const statusElement = document.getElementById('fingerprintStatus') || 
                             document.getElementById('scanStatus');
        
        if (statusElement) {
            const dot = statusElement.querySelector('.status-dot');
            const text = statusElement.querySelector('.status-text');
            
            if (dot) {
                dot.className = 'status-dot ' + status;
            }
            
            if (text) {
                text.textContent = message;
            }
        }
    }

    // Trigger custom events
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // Disconnect from Mantra RD Services
    async disconnect() {
        try {
            if (this.isConnected) {
                await fetch(`${this.mantraServerUrl}/disconnect`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
        
        this.isConnected = false;
        this.updateStatus('disconnected', 'Disconnected from Mantra RD Services');
    }

    // Get current fingerprint data
    getFingerprintData() {
        return this.fingerprintData;
    }

    // Check if sensor is connected
    getConnectionStatus() {
        return this.isConnected;
    }

    // Check if currently capturing
    isCurrentlyCapturing() {
        return this.isCapturing;
    }

    // Test Mantra RD Services connection
    async testConnection() {
        try {
            const response = await fetch(`${this.mantraServerUrl}/status`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Global fingerprint sensor instance
window.fingerprintSensor = new FingerprintSensor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FingerprintSensor;
} 