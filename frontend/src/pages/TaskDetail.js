import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await taskService.getTask(id);
        setTask(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load task details');
        setLoading(false);
        console.error('Task detail error:', err);
      }
    };

    fetchTask();
  }, [id]);

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        console.error('Delete task error:', err);
        alert('Failed to delete task');
      }
    }
  };

  const getFileNameFromUrl = (url) => {
    return url.split('/').pop().split('?')[0];
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Task not found
        </div>
        <Link to="/tasks" className="btn btn-primary">Back to Tasks</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title mb-0">{task.title}</h2>
                <div className="btn-group">
                  <Link to={`/tasks/edit/${task._id}`} className="btn btn-outline-primary">
                    <i className="bi bi-pencil me-1"></i> Edit
                  </Link>
                  <button
                    onClick={handleDeleteTask}
                    className="btn btn-outline-danger"
                  >
                    <i className="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6 className="text-muted">Status</h6>
                    <span className={`badge ${
                      task.status === 'completed' ? 'bg-success' : 
                      task.status === 'in-progress' ? 'bg-primary' : 
                      'bg-secondary'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6 className="text-muted">Priority</h6>
                    <span className={`badge ${
                      task.priority === 'high' ? 'bg-danger' : 
                      task.priority === 'medium' ? 'bg-warning text-dark' : 
                      'bg-info text-dark'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6 className="text-muted">Due Date</h6>
                    <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                  </div>
                </div>
              </div>

              {task.description && (
                <div className="mb-4">
                  <h5>Description</h5>
                  <p>{task.description}</p>
                </div>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <div className="mb-4">
                  <h5>Attachments</h5>
                  <div className="row">
                    {task.attachments.map((url, index) => {
                      const fileName = getFileNameFromUrl(url);
                      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                      
                      return (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="card">
                            {isImage ? (
                              <div className="position-relative">
                                <img 
                                  src={url} 
                                  alt={fileName} 
                                  className="card-img-top" 
                                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    console.error(`Failed to load image: ${url}`);
                                    e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
                                    e.target.alt = 'Image failed to load';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="card-body text-center">
                                <i className="bi bi-file-earmark-text fs-1"></i>
                              </div>
                            )}
                            <div className="card-body">
                              <h6 className="card-title">{fileName}</h6>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-primary"
                              >
                                <i className="bi bi-download me-1"></i> Download
                              </a>
                              <button 
                                className="btn btn-sm btn-link text-danger ms-2"
                                onClick={() => {
                                  console.log('Debug - Attachment URL:', url);
                                  window.open(url, '_blank');
                                }}
                              >
                                <i className="bi bi-arrows-fullscreen me-1"></i> Open
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between mt-4">
                <div>
                  <p className="text-muted small mb-0">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </p>
                  <p className="text-muted small">
                    Last Updated: {new Date(task.updatedAt).toLocaleString()}
                  </p>
                </div>
                <Link to="/tasks" className="btn btn-outline-secondary align-self-start">
                  Back to Tasks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 