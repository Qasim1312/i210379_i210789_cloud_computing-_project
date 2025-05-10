const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Log uploaded files for debugging
app.use('/uploads', (req, res, next) => {
  console.log('Attempting to access file:', req.url);
  const filePath = path.join(__dirname, 'uploads', req.url);
  
  if (fs.existsSync(filePath)) {
    console.log('File exists:', filePath);
    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size);
    console.log('File permissions:', stats.mode.toString(8));
  } else {
    console.log('File does not exist:', filePath);
  }
  
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Uploads test endpoint
app.get('/uploads-test', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  const response = {
    uploadDirExists: fs.existsSync(uploadDir),
    uploadDirPath: uploadDir,
    uploadDirContents: []
  };
  
  if (response.uploadDirExists) {
    try {
      function scanDir(dir, basePath = '') {
        const items = fs.readdirSync(dir);
        const result = [];
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            const subPath = path.join(basePath, item);
            result.push({
              name: item,
              path: subPath,
              type: 'directory',
              children: scanDir(itemPath, subPath)
            });
          } else {
            result.push({
              name: item,
              path: path.join(basePath, item),
              type: 'file',
              size: stats.size,
              url: `http://localhost:5000/uploads/${path.join(basePath, item)}`
            });
          }
        }
        
        return result;
      }
      
      response.uploadDirContents = scanDir(uploadDir);
    } catch (err) {
      response.error = err.message;
    }
  }
  
  res.json(response);
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'uploads')}`);
}); 