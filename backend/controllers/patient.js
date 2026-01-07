import db from '../config/database.js';
import fs from 'fs';
import path from 'path';

export default {
  // Get all patients
  
  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM patients ORDER BY id DESC');
      res.json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Get patient by phone (prefix match)
  getByPhone: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', pol.id,
              'policy_number', pol.policy_number,
              'plan_name', pol.plan_name,
              'status', pol.status,
              'end_date', pol.end_date
            )
          ) as policies
        FROM patients p 
        LEFT JOIN policies pol ON p.id = pol.patient_id 
        WHERE p.phone LIKE CONCAT(?, '%')
        GROUP BY p.id`,
        [req.params.phone]
      );

      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      // Parse policies JSON
      const patient = rows[0];
      if (patient.policies) {
        patient.policies = JSON.parse(`[${patient.policies}]`);
      } else {
        patient.policies = [];
      }

      res.json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Get patient by email (partial match)
  getByEmail: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', pol.id,
              'policy_number', pol.policy_number,
              'plan_name', pol.plan_name,
              'status', pol.status,
              'end_date', pol.end_date
            )
          ) as policies
        FROM patients p 
        LEFT JOIN policies pol ON p.id = pol.patient_id 
        WHERE p.email LIKE CONCAT('%', ?, '%')
        GROUP BY p.id`,
        [req.params.email]
      );

      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      // Parse policies JSON
      const patient = rows[0];
      if (patient.policies) {
        patient.policies = JSON.parse(`[${patient.policies}]`);
      } else {
        patient.policies = [];
      }

      res.json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Get patient by name (partial match)
  getByName: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', pol.id,
              'policy_number', pol.policy_number,
              'plan_name', pol.plan_name,
              'status', pol.status,
              'end_date', pol.end_date
            )
          ) as policies
        FROM patients p 
        LEFT JOIN policies pol ON p.id = pol.patient_id 
        WHERE CONCAT(p.first_name, ' ', p.last_name) LIKE ? 
        GROUP BY p.id`,
        [`%${req.params.name}%`]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      // Parse policies for the first result
      const patient = rows[0];
      if (patient.policies) {
        patient.policies = JSON.parse(`[${patient.policies}]`);
      } else {
        patient.policies = [];
      }
      
      res.json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Create patient with optional image upload
  create: async (req, res) => {
    try {
      const { first_name, last_name, age, city, phone, email } = req.body;

      // Check duplicate phone
      const [existing] = await db.execute('SELECT id FROM patients WHERE phone = ?', [phone]);
      if (existing.length > 0) {
        // Delete uploaded file if phone exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false, 
          error: 'Phone number already exists' 
        });
      }

      // Get image path if uploaded
      const image_url = req.file ? `/uploads/patients/${req.file.filename}` : null;

      const [result] = await db.execute(
        'INSERT INTO patients (first_name, last_name, age, city, phone, email, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, age, city, phone, email, image_url]
      );

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: { 
          id: result.insertId, 
          first_name, 
          last_name, 
          phone,
          image_url 
        }
      });
    } catch (error) {
      // Delete uploaded file if database insert fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Update patient (without image)
  update: async (req, res) => {
    try {
      const { first_name, last_name, age, city, phone, email } = req.body;
      const patientId = req.params.id;

      // Check if patient exists
      const [existing] = await db.execute('SELECT id FROM patients WHERE id = ?', [patientId]);
      if (existing.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      const [result] = await db.execute(
        'UPDATE patients SET first_name = ?, last_name = ?, age = ?, city = ?, phone = ?, email = ? WHERE id = ?',
        [first_name, last_name, age, city, phone, email, patientId]
      );

      res.json({
        success: true,
        message: 'Patient updated successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Update patient image only
  updateImage: async (req, res) => {
    try {
      const patientId = req.params.id;
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No image file provided' 
        });
      }

      // Get old image path to delete it
      const [rows] = await db.execute(
        'SELECT image_url FROM patients WHERE id = ?',
        [patientId]
      );

      if (rows.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      const image_url = `/uploads/patients/${req.file.filename}`;

      // Update database
      await db.execute(
        'UPDATE patients SET image_url = ? WHERE id = ?',
        [image_url, patientId]
      );

      // Delete old image if exists
      if (rows[0].image_url) {
        const oldImagePath = path.join(process.cwd(), rows[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      res.json({
        success: true,
        message: 'Patient image updated successfully',
        data: { image_url }
      });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Delete patient (CASCADE will delete policies too)
  delete: async (req, res) => {
    try {
      const patientId = req.params.id;

      // Get patient to delete image file
      const [patient] = await db.execute('SELECT image_url FROM patients WHERE id = ?', [patientId]);
      
      if (patient.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      // Delete patient from database
      const [result] = await db.execute('DELETE FROM patients WHERE id = ?', [patientId]);

      // Delete image file if exists
      if (patient[0].image_url) {
        const imagePath = path.join(process.cwd(), patient[0].image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      res.json({
        success: true,
        message: 'Patient deleted successfully (with all policies via CASCADE)'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};
