const db = require('../config/db');

// Complaint-related database operations
const ComplaintModel = {
  async createComplaint({ userId, category, description, priority, imagePath }) {
    const now = new Date();
    const [result] = await db.execute(
      `INSERT INTO complaints (user_id, category, description, priority, status, image_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?)`,
      [userId, category, description, priority, imagePath || null, now, now]
    );
    return result.insertId;
  },

  async getComplaintsByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async getAllComplaints({ status, category, priority }) {
    // Build dynamic WHERE clause for admin filters
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.execute(
      `SELECT c.*, u.name AS student_name, u.hostel_block, u.room_number
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );
    return rows;
  },

  async updateStatus(id, status) {
    const now = new Date();
    const resolvedAt = status === 'Resolved' ? now : null;
    const [result] = await db.execute(
      `UPDATE complaints
       SET status = ?, updated_at = ?, resolved_at = ?
       WHERE id = ?`,
      [status, now, resolvedAt, id]
    );
    return result.affectedRows > 0;
  },

  async deleteComplaint(id) {
    const [result] = await db.execute(
      'DELETE FROM complaints WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  async getDashboardStats() {
    const [rows] = await db.execute(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
       FROM complaints`
    );
    return rows[0];
  }
};

module.exports = ComplaintModel;

