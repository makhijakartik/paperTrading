const bcrypt = require('bcrypt');
const pool = require('../config/db');

const INITIAL_VIRTUAL_CASH = 100000.00;

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, virtual_cash) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, INITIAL_VIRTUAL_CASH]
    );

    // Automatically log the user in after signup
    req.session.userId = result.insertId;

    res.status(201).json({ 
      message: 'Account created successfully!', 
      userId: result.insertId,
      virtual_cash: INITIAL_VIRTUAL_CASH
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create session
    req.session.userId = user.id;
    
    res.json({ message: 'Login successful.', virtual_cash: user.virtual_cash });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
};

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, virtual_cash, created_at FROM users WHERE id = ?', [req.session.userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
