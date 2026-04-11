const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      gym_id: user.gym_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

const register = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { gym_name, first_name, last_name, email, password } = req.body;

    if (!gym_name || !first_name || !last_name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'Email is already in use'
      });
    }

    let slug = generateSlug(gym_name);

    const [existingGyms] = await connection.query(
      'SELECT id FROM gyms WHERE slug = ?',
      [slug]
    );

    if (existingGyms.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [gymResult] = await connection.query(
      'INSERT INTO gyms (name, slug) VALUES (?, ?)',
      [gym_name, slug]
    );

    const gymId = gymResult.insertId;

    const [userResult] = await connection.query(
      `INSERT INTO users (gym_id, first_name, last_name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'owner')`,
      [gymId, first_name, last_name, email, passwordHash]
    );

    const userId = userResult.insertId;

    await connection.commit();

    const [rows] = await connection.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, g.name AS gym_name, g.slug
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       WHERE u.id = ?`,
      [userId]
    );

    const user = rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    await connection.rollback();
    console.error('Register error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.password_hash, u.role,
              g.name AS gym_name, g.slug
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        gym_id: user.gym_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        gym_name: user.gym_name,
        slug: user.slug
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              g.name AS gym_name, g.slug
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get me error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};