import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error if there was one
      if (formErrors.profileImage) {
        setFormErrors({ ...formErrors, profileImage: '' });
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const { username, email, password, confirmPassword } = formData;

    if (!username || username.trim() === '') {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (profileImage && profileImage.size > 5 * 1024 * 1024) {
      errors.profileImage = 'Image size must be less than 5MB';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        
        if (profileImage) {
          formDataToSend.append('profileImage', profileImage);
        }
        
        const result = await register(formDataToSend);
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setRegisterError(result.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        setRegisterError('An error occurred during registration. Please try again.');
        console.error('Registration error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Create an Account</h2>
              
              {registerError && (
                <div className="alert alert-danger" role="alert">
                  {registerError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3 text-center">
                  <div className="profile-image-container mb-3">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile Preview" 
                        className="rounded-circle img-thumbnail" 
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="bg-light rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: '150px', height: '150px', margin: '0 auto' }}
                      >
                        <i className="bi bi-person-fill" style={{ fontSize: '4rem' }}></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="profileImage" className="form-label">Profile Image (Optional)</label>
                    <input
                      type="file"
                      className={`form-control ${formErrors.profileImage ? 'is-invalid' : ''}`}
                      id="profileImage"
                      name="profileImage"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    {formErrors.profileImage && (
                      <div className="invalid-feedback">{formErrors.profileImage}</div>
                    )}
                    <div className="form-text">Max file size: 5MB</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                  />
                  {formErrors.username && (
                    <div className="invalid-feedback">{formErrors.username}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback">{formErrors.email}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                  />
                  {formErrors.password && (
                    <div className="invalid-feedback">{formErrors.password}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  {formErrors.confirmPassword && (
                    <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : 'Register'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p>
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 