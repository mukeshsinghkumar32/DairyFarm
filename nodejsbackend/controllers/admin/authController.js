const jwt  = require('jsonwebtoken');
const Admin = require('../../models/Admin');

// ─── POST /api/v1/admin/login ────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'sohani_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: admin.toJSON(),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/v1/admin/logout ───────────────────────────────────────────────
// JWT is stateless – just acknowledge. Client removes the token.
exports.logout = async (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};
