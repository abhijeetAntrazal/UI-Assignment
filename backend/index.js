import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - CORS should be before routes
app.use(cors({
  origin: "*" // In production, specify your frontend domain
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

// Serve static files (public folder and uploads)
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Import database
import db from './config/database.js';
db.testConnection();

// Import routes
import patientRoutes from './routes/patient.js';
import policyRoutes from './routes/policies.js';

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'HealthSure Backend Working! 🚀' });
});

// API Routes
app.use('/api/patients', patientRoutes);  // All patient operations
app.use('/api/policies', policyRoutes);   // All policy operations

// Error handling middleware for multer (file upload errors)
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'File size too large. Maximum size is 5MB' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      error: 'File upload error: ' + err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
  console.log(`📱 Test: http://localhost:${PORT}/api/test`);
  console.log(`👥 Patients: http://localhost:${PORT}/api/patients`);
  console.log(`📋 Policies: http://localhost:${PORT}/api/policies`);
});
