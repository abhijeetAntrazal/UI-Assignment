import express from 'express';
import patientController from '../controllers/patient.js';
import upload from '../middleware/upload.js'; // Import multer middleware

const router = express.Router();



// Search routes (specific paths first)
router.get('/email/:email', patientController.getByEmail);
router.get('/name/:name', patientController.getByName);
router.get('/phone/:phone', patientController.getByPhone);

// Get all patients
router.get('/', patientController.getAll);

// Create patient with optional image upload
router.post('/', upload.single('image'), patientController.create);

// Update patient image only
router.put('/:id/image', upload.single('image'), patientController.updateImage);

// Update patient info (without image)
router.put('/:id', patientController.update);

// Delete patient
router.delete('/:id', patientController.delete);

export default router;
