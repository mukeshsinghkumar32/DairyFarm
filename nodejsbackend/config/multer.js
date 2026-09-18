const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = path.join(__dirname, '..', 'uploads');
const productDir = path.join(baseUploadDir, 'products');
const sellerDir = path.join(baseUploadDir, 'sellers');
const categoryDir = path.join(baseUploadDir, 'categories');

[baseUploadDir, productDir, sellerDir, categoryDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const url = `${req.baseUrl || ''}${req.originalUrl || ''}${req.url || ''}`;
    if (url.includes('seller')) {
      cb(null, sellerDir);
    } else if (url.includes('categor')) {
      cb(null, categoryDir);
    } else {
      cb(null, productDir);
    }
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = upload;
