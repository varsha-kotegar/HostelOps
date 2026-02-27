const db = require('../config/db');

// User-related database operations
const UserModel = {
  async createUser({ name, email, passwordHash, hostelBlock, roomNumber, role = 'student' }) {
    const now = new Date();
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password_hash, hostel_block, room_number, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, hostelBlock, roomNumber, role, now, now]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = UserModel;

