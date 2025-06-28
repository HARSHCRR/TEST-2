const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://healthchainpvt:4wAGXVUil6MowI7Z@cluster0.shpp0t0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Patient Schema
const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    medicalDocument: { type: String },
    fingerprintData: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/doctor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'doctor.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// API Routes
app.post('/api/patients', upload.single('medicalDocument'), async (req, res) => {
    try {
        const { name, age, gender, bloodGroup, fingerprintData } = req.body;
        
        const patient = new Patient({
            name,
            age: parseInt(age),
            gender,
            bloodGroup,
            medicalDocument: req.file ? req.file.path : '',
            fingerprintData
        });

        await patient.save();
        res.status(201).json({ success: true, message: 'Patient registered successfully', patient });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ success: false, message: 'Error registering patient' });
    }
});

app.post('/api/patients/scan', async (req, res) => {
    try {
        const { fingerprintData } = req.body;
        
        // Find patient by fingerprint data
        const patient = await Patient.findOne({ fingerprintData });
        
        if (patient) {
            res.json({ success: true, patient });
        } else {
            res.status(404).json({ success: false, message: 'Patient not found' });
        }
    } catch (error) {
        console.error('Error scanning patient:', error);
        res.status(500).json({ success: false, message: 'Error scanning patient' });
    }
});

app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json({ success: true, patients });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ success: false, message: 'Error fetching patients' });
    }
});

app.get('/api/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        
        if (patient) {
            res.json({ success: true, patient });
        } else {
            res.status(404).json({ success: false, message: 'Patient not found' });
        }
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ success: false, message: 'Error fetching patient' });
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} for the application`);
}); 