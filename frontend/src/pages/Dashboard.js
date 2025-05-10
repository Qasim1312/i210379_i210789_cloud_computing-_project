import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await taskService.getAllTasks();
        const tasks = response.data;
        
        // Calculate stats
        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        
        setStats({
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks
        });
        
        // Get 5 most recent tasks
        const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTasks(sortedTasks.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error('Dashboard data error:', err);
      }
    };

    fetchDashboardData();
  }, []);

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
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Welcome, {user?.username}!</h2>
              <p className="card-text">Here's a summary of your tasks.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <div className="card bg-primary text-white shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Total Tasks</h5>
              <h2 className="display-4">{stats.totalTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <div className="card bg-warning text-dark shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <h2 className="display-4">{stats.pendingTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <div className="card bg-info text-white shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">In Progress</h5>
              <h2 className="display-4">{stats.inProgressTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card bg-success text-white shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Completed</h5>
              <h2 className="display-4">{stats.completedTasks}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Tasks</h5>
              <Link to="/tasks" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body">
              {recentTasks.length > 0 ? (
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
                      {recentTasks.map(task => (
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
                            <Link to={`/tasks/${task._id}`} className="btn btn-sm btn-outline-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-3">You don't have any tasks yet.</p>
                  <Link to="/tasks/new" className="btn btn-primary">
                    Create Your First Task
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12 text-center">
          <Link to="/tasks/new" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i> Create New Task
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 