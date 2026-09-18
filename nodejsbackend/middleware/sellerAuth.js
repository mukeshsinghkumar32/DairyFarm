const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');

module.exports = async function sellerAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthenticated seller.' });
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'sohani_secret');
    const seller = await Seller.findById(payload.id).select('-password');
    if (!seller || seller.status === 'inactive') {
      return res.status(401).json({ success: false, message: 'Seller account not found or inactive.' });
    }
    req.seller = seller;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthenticated seller.' });
  }
};
