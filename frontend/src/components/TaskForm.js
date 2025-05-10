import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';

const TaskForm = ({ taskId, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(isEditing);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      if (isEditing && taskId) {
        try {
          setLoading(true);
          const response = await taskService.getTask(taskId);
          const task = response.data;
          
          setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
          });
          
          if (task.attachments && task.attachments.length > 0) {
            setExistingAttachments(task.attachments);
          }
          
          setLoading(false);
        } catch (err) {
          setFormError('Failed to load task');
          setLoading(false);
          console.error('Load task error:', err);
        }
      }
    };

    fetchTask();
  }, [isEditing, taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log('Files selected:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
      setAttachments(files);
    }
  };

  const handleRemoveExistingAttachment = async (attachmentUrl) => {
    if (window.confirm('Are you sure you want to remove this attachment?')) {
      try {
        await taskService.removeAttachment(taskId, attachmentUrl);
        setExistingAttachments(existingAttachments.filter(url => url !== attachmentUrl));
      } catch (err) {
        console.error('Remove attachment error:', err);
        alert('Failed to remove attachment');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const { title } = formData;

    if (!title || title.trim() === '') {
      errors.title = 'Title is required';
    }

    // Add more validation as needed

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create FormData for attachments
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('priority', formData.priority);
        
        if (formData.dueDate) {
          formDataToSend.append('dueDate', formData.dueDate);
        }
        
        // Append attachments
        if (attachments.length > 0) {
          console.log('Appending', attachments.length, 'files to FormData');
          attachments.forEach((file, index) => {
            console.log(`Adding file ${index}:`, file.name, file.type);
            formDataToSend.append('attachments', file);
          });
        } else {
          console.log('No attachments to upload');
        }
        
        // Debug FormData
        console.log('FormData entries:');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0], typeof pair[1] === 'object' ? `File: ${pair[1].name}` : pair[1]);
        }
        
        let result;
        
        if (isEditing) {
          console.log('Updating task with ID:', taskId);
          result = await taskService.updateTask(taskId, formDataToSend);
        } else {
          console.log('Creating new task');
          result = await taskService.createTask(formDataToSend);
        }
        
        console.log('Task saved successfully:', result);
        navigate('/tasks');
      } catch (error) {
        const errorMsg = error.response?.data?.message || 
          `Failed to ${isEditing ? 'update' : 'create'} task`;
        setFormError(errorMsg);
        console.error('Task form error:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getFileNameFromUrl = (url) => {
    return url.split('/').pop().split('?')[0];
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="card-title mb-4">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
            />
            {formErrors.title && (
              <div className="invalid-feedback">{formErrors.title}</div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Task description"
            ></textarea>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                className="form-select"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="col-md-4">
              <label htmlFor="priority" className="form-label">Priority</label>
              <select
                className="form-select"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="col-md-4">
              <label htmlFor="dueDate" className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="attachments" className="form-label">Attachments</label>
            <input
              type="file"
              className="form-control"
              id="attachments"
              name="attachments"
              onChange={handleFileChange}
              multiple
            />
            <div className="form-text">
              You can upload multiple files (max 5 files, 5MB each)
            </div>
          </div>
          
          {attachments.length > 0 && (
            <div className="mb-4">
              <h6>New Attachments:</h6>
              <ul className="list-group">
                {attachments.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-paperclip me-2"></i>
                      {file.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {existingAttachments.length > 0 && (
            <div className="mb-4">
              <h6>Existing Attachments:</h6>
              <ul className="list-group">
                {existingAttachments.map((url, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-paperclip me-2"></i>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {getFileNameFromUrl(url)}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveExistingAttachment(url)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 