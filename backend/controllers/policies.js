import db from '../config/database.js';

export default {
  //   FIXED: getAll: async (req, res) => { }
  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT pol.*, p.first_name, p.last_name, p.phone 
        FROM policies pol 
        LEFT JOIN patients p ON pol.patient_id = p.id 
        ORDER BY pol.id DESC
      `);
      
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

  //   FIXED: getById
  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT pol.*, p.first_name, p.last_name, p.phone 
        FROM policies pol 
        LEFT JOIN patients p ON pol.patient_id = p.id 
        WHERE pol.id = ?
      `, [req.params.id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Policy not found' 
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

  //   FIXED: create
  create: async (req, res) => {
    try {
      const { patient_id, policy_number, plan_name, sum_insured, start_date, end_date } = req.body;

      const [patient] = await db.execute('SELECT id FROM patients WHERE id = ?', [patient_id]);
      if (patient.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Patient not found' 
        });
      }

      const [existing] = await db.execute('SELECT id FROM policies WHERE policy_number = ?', [policy_number]);
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Policy number already exists' 
        });
      }

      const [result] = await db.execute(
        `INSERT INTO policies (patient_id, policy_number, plan_name, sum_insured, start_date, end_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [patient_id, policy_number, plan_name, sum_insured, start_date, end_date]
      );

      res.status(201).json({
        success: true,
        message: 'Policy created successfully',
        data: { id: result.insertId, policy_number }
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  //   FIXED: cancel
 cancel: async (req, res) => {
    try {
      const { reason } = req.body;
      const policyId = req.params.id;

      const [result] = await db.execute(
        `UPDATE policies 
         SET status = 'CANCELLED', cancel_reason = ? 
         WHERE id = ? AND status = 'ACTIVE'`,
        [reason, policyId]
      );

      //   CORRECT: result.affectedRows (not result[0])
      if (result.affectedRows === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Policy not found or already cancelled/expired' 
        });
      }

      res.json({
        success: true,
        message: 'Policy cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },


  //   FIXED: renew
 renew: async (req, res) => {
    try {
      const { end_date } = req.body;
      const policyId = req.params.id;

      const [result] = await db.execute(
        `UPDATE policies 
         SET status = 'ACTIVE', end_date = ?, cancel_reason = NULL 
         WHERE id = ? AND status IN ('ACTIVE', 'EXPIRED')`,
        [end_date, policyId]
      );

      //   CORRECT: result.affectedRows
      if (result.affectedRows === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Policy not found or already cancelled' 
        });
      }

      res.json({
        success: true,
        message: 'Policy renewed successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  },


  //   FIXED: dashboard
  dashboard: async (req, res) => {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_policies,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_policies,
          SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_policies,
          SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired_policies,
          COUNT(CASE WHEN end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'ACTIVE' THEN 1 END) as expiring_soon
        FROM policies
      `);

      res.json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};
