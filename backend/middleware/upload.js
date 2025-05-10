const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  console.log('Processing file in multer:', file.originalname, file.mimetype);
  
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected:', file.originalname, 'Type not allowed:', file.mimetype);
    cb(new Error(`Unsupported file type: ${file.mimetype}!`), false);
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Add debug information on upload.array to track what's happening
const originalArray = upload.array;
upload.array = function(fieldName, maxCount) {
  console.log(`Setting up multer upload.array for field: ${fieldName}, max: ${maxCount}`);
  const middleware = originalArray.call(this, fieldName, maxCount);
  
  return function(req, res, next) {
    console.log('Multer middleware triggered', { 
      method: req.method,
      path: req.path,
      contentType: req.headers['content-type'],
      hasBodyFiles: req.body && req.body.files ? 'yes' : 'no'
    });
    
    middleware(req, res, function(err) {
      if (err) {
        console.error('Multer error:', err.message);
        return next(err);
      }
      
      console.log('Multer processed request', {
        filesReceived: req.files ? req.files.length : 0
      });
      
      next();
    });
  };
};

module.exports = upload; 