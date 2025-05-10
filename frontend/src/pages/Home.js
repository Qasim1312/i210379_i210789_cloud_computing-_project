import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-10 mx-auto text-center">
          <div className="py-5">
            <h1 className="display-4 fw-bold mb-4">Welcome to Task Manager</h1>
            <p className="lead mb-4">
              A secure cloud-based task management application built with React and Node.js,
              deployed on AWS infrastructure.
            </p>
            
            {isAuthenticated ? (
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link to="/dashboard" className="btn btn-primary btn-lg px-4 me-md-2">
                  Go to Dashboard
                </Link>
                <Link to="/tasks" className="btn btn-outline-secondary btn-lg px-4">
                  View Tasks
                </Link>
              </div>
            ) : (
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link to="/login" className="btn btn-primary btn-lg px-4 me-md-2">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg px-4">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="row mt-5">
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <i className="bi bi-lock-fill fs-1 text-primary mb-3"></i>
                  <h3>Secure Authentication</h3>
                  <p>
                    Robust user authentication and authorization system to keep your data safe.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <i className="bi bi-list-check fs-1 text-primary mb-3"></i>
                  <h3>Task Management</h3>
                  <p>
                    Create, update, and manage tasks with priority levels and status tracking.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <i className="bi bi-cloud-arrow-up-fill fs-1 text-primary mb-3"></i>
                  <h3>File Uploads</h3>
                  <p>
                    Attach files and images to your tasks, securely stored in AWS S3.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5">
            <h2>Built with Modern Technologies</h2>
            <div className="row mt-4">
              <div className="col-6 col-md-3 mb-4">
                <div className="p-3">
                  <i className="bi bi-filetype-jsx fs-1"></i>
                  <h5 className="mt-2">React</h5>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-4">
                <div className="p-3">
                  <i className="bi bi-hdd-stack fs-1"></i>
                  <h5 className="mt-2">Node.js</h5>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-4">
                <div className="p-3">
                  <i className="bi bi-database fs-1"></i>
                  <h5 className="mt-2">MongoDB</h5>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-4">
                <div className="p-3">
                  <i className="bi bi-cloud fs-1"></i>
                  <h5 className="mt-2">AWS</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 