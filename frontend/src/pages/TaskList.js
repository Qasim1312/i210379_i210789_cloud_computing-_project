import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskService.getAllTasks();
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load tasks');
        setLoading(false);
        console.error('Task list error:', err);
      }
    };

    fetchTasks();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: ''
    });
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = !filters.status || task.status === filters.status;
    const priorityMatch = !filters.priority || task.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (err) {
        console.error('Delete task error:', err);
        alert('Failed to delete task');
      }
    }
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Tasks</h2>
        <Link to="/tasks/new" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i> New Task
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3 mb-md-0">
              <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
              <select
                id="statusFilter"
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <label htmlFor="priorityFilter" className="form-label">Filter by Priority</label>
              <select
                id="priorityFilter"
                name="priority"
                className="form-select"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task._id}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge ${
                          task.priority === 'high' ? 'bg-danger' : 
                          task.priority === 'medium' ? 'bg-warning text-dark' : 
                          'bg-info text-dark'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          task.status === 'completed' ? 'bg-success' : 
                          task.status === 'in-progress' ? 'bg-primary' : 
                          'bg-secondary'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/tasks/${task._id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                          <Link to={`/tasks/edit/${task._id}`} className="btn btn-sm btn-outline-secondary">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body py-5">
            <div className="text-center">
              <p className="mb-3">No tasks found with the selected filters.</p>
              {(filters.status || filters.priority) ? (
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-primary"
                >
                  Clear Filters
                </button>
              ) : (
                <Link to="/tasks/new" className="btn btn-primary">
                  Create Your First Task
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList; 