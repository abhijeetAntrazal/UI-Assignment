import express from 'express';
import cors from 'cors';

const app = express();  

import dotenv from 'dotenv';
dotenv.config();

app.use(express.json()); 
app.use(express.static('public')); 

// Import routes
import patientRoutes from './routes/patient.js';
import policyRoutes from './routes/policies.js';

// Import database
import db from './config/database.js';
db.testConnection(); 


app.use(cors({
  origin: "*"
}));


// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'HealthSure Backend Working! 🚀' });
});

// ✅ ROUTES CONNECTED (Replace old hardcoded routes)
app.use('/api/patients', patientRoutes);  // All patient operations
app.use('/api/policies', policyRoutes);   // All policy operations

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
  console.log(`📱 Test: http://localhost:${PORT}/api/test`);
  console.log(`👥 Patients: http://localhost:${PORT}/api/patients`);
  console.log(`📋 Policies: http://localhost:${PORT}/api/policies`);
});
