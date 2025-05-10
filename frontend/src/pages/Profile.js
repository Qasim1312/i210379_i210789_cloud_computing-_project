import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    username: user?.username || ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      
      const result = await updateProfile(formDataToSend);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully'
        });
      } else {
        setMessage({
          type: 'danger',
          text: result.message || 'Failed to update profile'
        });
      }
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'An error occurred while updating profile'
      });
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">My Profile</h2>
              
              {message.text && (
                <div className={`alert alert-${message.type}`} role="alert">
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="rounded-circle img-thumbnail mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="bg-light rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
                      style={{ width: '150px', height: '150px' }}
                    >
                      <i className="bi bi-person-fill" style={{ fontSize: '4rem' }}></i>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="profileImage" className="form-label">Profile Picture</label>
                    <input
                      type="file"
                      className="form-control"
                      id="profileImage"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <div className="form-text">Max file size: 5MB</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <div className="form-text">Email cannot be changed</div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="card mt-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Account Information</h5>
              <p className="mb-1">
                <strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 