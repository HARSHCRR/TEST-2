# Healthcare Fingerprint System

A modern web application for healthcare facilities that integrates with the Mantra MFS110 fingerprint sensor for secure patient identification and management.

## Features

### 🏥 Patient Registration
- Complete patient information capture (name, age, gender, blood group)
- Medical document upload support (PDF, DOC, DOCX, JPG, PNG)
- **Mantra MFS110 fingerprint sensor integration**
- Real-time form validation
- Secure data storage in MongoDB

### 👨‍⚕️ Doctor Dashboard
- **Fingerprint-based patient identification**
- Quick patient lookup using biometric authentication
- Display of complete patient information
- Recent patients list
- Modern, responsive interface

### 🔐 Security Features
- CORS-enabled for cross-origin requests
- Secure fingerprint data handling
- File upload security
- MongoDB integration with proper error handling

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB Atlas** account (or local MongoDB)
- **Mantra MFS110 fingerprint sensor**
- **Windows laptop** (for sensor compatibility)
- **Modern web browser** with Web Serial API support (Chrome, Edge)

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd healthcare-fingerprint-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure MongoDB connection**
   - The application is pre-configured with the provided MongoDB Atlas URL
   - For local MongoDB, update the `MONGODB_URI` in `server.js`

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will be available on all network interfaces

## Fingerprint Sensor Setup

### Mantra MFS110 Integration

The application uses the **Web Serial API** to communicate with the Mantra MFS110 fingerprint sensor:

1. **Connect the sensor** to your Windows laptop via USB
2. **Install sensor drivers** if required (usually auto-installed)
3. **Grant browser permissions** when prompted for serial port access
4. **Use Chrome or Edge** browser for best compatibility

### Sensor Communication

The application automatically:
- Detects the Mantra MFS110 sensor
- Establishes serial communication (9600 baud rate)
- Handles fingerprint capture and data processing
- Provides fallback simulation for development/testing

## Usage

### Patient Registration

1. Navigate to the **Patient Registration** page
2. Fill in all required patient information:
   - Full Name
   - Age
   - Gender
   - Blood Group
3. Upload medical documents (optional)
4. **Capture fingerprint** using the Mantra MFS110 sensor
5. Submit the form to register the patient

### Doctor Dashboard

1. Access the **Doctor Dashboard**
2. Click **"Scan Fingerprint"** to identify a patient
3. Place the patient's finger on the Mantra MFS110 sensor
4. View patient information if a match is found
5. Access recent patients list for quick reference

## API Endpoints

### Patient Management
- `POST /api/patients` - Register new patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get specific patient
- `POST /api/patients/scan` - Search patient by fingerprint

### File Upload
- Supports medical document uploads
- Automatic file storage in `uploads/` directory
- Secure file handling with multer

## Project Structure

```
healthcare-fingerprint-system/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html         # Landing page
│   ├── signup.html        # Patient registration
│   ├── doctor.html        # Doctor dashboard
│   ├── styles.css         # Main stylesheet
│   ├── fingerprint.js     # Sensor integration
│   ├── signup.js          # Registration logic
│   └── doctor.js          # Dashboard logic
├── uploads/               # File upload directory
└── README.md             # This file
```

## Technical Details

### Frontend Technologies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **Web Serial API** - Fingerprint sensor communication

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Database Schema

```javascript
Patient {
  name: String (required)
  age: Number (required)
  gender: String (required)
  bloodGroup: String (required)
  medicalDocument: String (optional)
  fingerprintData: String (required)
  createdAt: Date (auto-generated)
}
```

## Browser Compatibility

### Supported Browsers
- **Chrome** (v89+) - Full Web Serial API support
- **Edge** (v89+) - Full Web Serial API support
- **Firefox** - Limited support (fallback mode)
- **Safari** - Limited support (fallback mode)

### Web Serial API Requirements
- **HTTPS** or **localhost** connection required
- **User gesture** required for sensor access
- **Windows** recommended for Mantra MFS110 compatibility

## Development

### Running in Development Mode
```bash
npm run dev
```

### File Structure for Development
- All frontend files are in the `public/` directory
- Server-side code is in `server.js`
- Static file serving is configured for the `public/` directory

### Adding New Features
1. Frontend changes: Edit files in `public/`
2. Backend changes: Modify `server.js`
3. Database changes: Update the Mongoose schema

## Troubleshooting

### Common Issues

1. **Sensor not detected**
   - Ensure Mantra MFS110 is properly connected
   - Check USB drivers are installed
   - Try different USB port
   - Restart browser and application

2. **CORS errors**
   - Application is configured to allow all origins
   - Check browser console for specific error messages

3. **MongoDB connection issues**
   - Verify internet connection
   - Check MongoDB Atlas credentials
   - Ensure IP whitelist includes your IP

4. **File upload errors**
   - Check `uploads/` directory permissions
   - Verify file size limits
   - Ensure supported file formats

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=* npm start
```

## Security Considerations

- **HTTPS** recommended for production deployment
- **Input validation** implemented on both frontend and backend
- **File upload restrictions** in place
- **MongoDB injection protection** via Mongoose
- **CORS configuration** for controlled access

## Production Deployment

### Environment Variables
```bash
PORT=3000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

### Deployment Options
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control over server environment
- **DigitalOcean** - Scalable cloud hosting
- **Local server** - For internal network use

## Support

For technical support or questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Verify sensor compatibility and drivers
4. Ensure all prerequisites are met

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Mantra Softech** for the MFS110 fingerprint sensor
- **MongoDB Atlas** for cloud database hosting
- **Web Serial API** for browser-based sensor communication
