const Task = require('../models/Task');
const { uploadFileToS3, deleteFileFromS3 } = require('../config/s3');

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      user: req.user._id
    });

    // Upload attachments if they exist
    if (req.files && req.files.length > 0) {
      task.attachments = [];
      
      console.log('Files received in createTask:', req.files.length);
      console.log('File details:', req.files.map(f => ({
        name: f.originalname,
        size: f.size,
        mimetype: f.mimetype
      })));
      
      for (const file of req.files) {
        try {
          const fileUrl = await uploadFileToS3(file, 'task-attachments');
          console.log('Successfully uploaded file, URL:', fileUrl);
          task.attachments.push(fileUrl);
        } catch (uploadError) {
          console.error('Error uploading individual file:', uploadError);
        }
      }
      
      console.log('Uploaded file URLs:', task.attachments);
    } else {
      console.log('No files received in request');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request headers:', req.headers);
    }

    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    // Find the task
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update fields
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (dueDate) updates.dueDate = dueDate;
    
    // Upload new attachments if they exist
    if (req.files && req.files.length > 0) {
      console.log('Files received in updateTask:', req.files.length);
      
      if (!task.attachments) task.attachments = [];
      
      for (const file of req.files) {
        try {
          const fileUrl = await uploadFileToS3(file, 'task-attachments');
          console.log('Successfully uploaded file, URL:', fileUrl);
          task.attachments.push(fileUrl);
        } catch (uploadError) {
          console.error('Error uploading individual file:', uploadError);
        }
      }
      
      updates.attachments = task.attachments;
      console.log('Updated attachments list:', updates.attachments);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete all attachments from S3
    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        await deleteFileFromS3(attachment);
      }
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove an attachment from a task
exports.removeAttachment = async (req, res) => {
  try {
    const { attachmentUrl } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (!task.attachments.includes(attachmentUrl)) {
      return res.status(400).json({ message: 'Attachment not found in this task' });
    }
    
    // Delete the attachment from S3
    await deleteFileFromS3(attachmentUrl);
    
    // Remove it from the task
    task.attachments = task.attachments.filter(url => url !== attachmentUrl);
    await task.save();
    
    res.json({
      message: 'Attachment removed successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 