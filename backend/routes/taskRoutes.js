const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all tasks (requires authentication)
router.get('/', auth, taskController.getTasks);

// Get a single task (requires authentication)
router.get('/:id', auth, taskController.getTask);

// Create a new task (requires authentication)
router.post('/', auth, upload.array('attachments', 5), taskController.createTask);

// Update a task (requires authentication)
router.put('/:id', auth, upload.array('attachments', 5), taskController.updateTask);

// Delete a task (requires authentication)
router.delete('/:id', auth, taskController.deleteTask);

// Remove an attachment from a task
router.post('/:id/remove-attachment', auth, taskController.removeAttachment);

module.exports = router; 