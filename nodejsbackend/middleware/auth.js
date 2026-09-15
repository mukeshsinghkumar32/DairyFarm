const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'sohani_secret');
    const admin = await Admin.findById(payload.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthenticated.' });
  }
};
