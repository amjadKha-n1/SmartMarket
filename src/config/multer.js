const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    if (file.fieldname === 'storeLogo') {
      cb(null, path.join(__dirname, '..', 'public', 'images', 'stores'));
    } else if (file.fieldname === 'productImage') {
      cb(null, path.join(__dirname, '..', 'public', 'images', 'products'));
    } else if (file.fieldname === 'image'){
      cb(null, path.join(__dirname, '..', 'public', 'images', 'categories'))
    } else {
      cb(null, path.join(__dirname, '..', 'public', 'images', 'others'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
