import db from '../config/database.js';

export default {
  //  getAll: async (req, res) => { }
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

  // FIXED: getByPhone
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

  //FIXED: get by email
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


  // FIXED: getByName
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
      
      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  //   FIXED: create (duplicate phone check add kiya)
  create: async (req, res) => {
    try {
      const { first_name, last_name, age, city, phone, email } = req.body;

      // Check duplicate phone
      const [existing] = await db.execute('SELECT id FROM patients WHERE phone = ?', [phone]);
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Phone number already exists' 
        });
      }

      const [result] = await db.execute(
        'INSERT INTO patients (first_name, last_name, age, city, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, age, city, phone, email]
      );

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: { id: result.insertId, first_name, last_name, phone }
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  //   FIXED: update
  update: async (req, res) => {
    try {
      const { first_name, last_name, age, city, phone, email } = req.body;
      const patientId = req.params.id;

      await db.execute(
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

  //   FIXED: delete
  delete: async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);

      if (result[0].affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Patient not found' 
        });
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
