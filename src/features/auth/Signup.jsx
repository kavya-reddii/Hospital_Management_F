import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // 1. Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';

    // 2. Full name - must start with capital letter
    if (formData.fullName && !/^[A-Z][a-zA-Z\s]*$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name must start with capital letter';
    }

    // 3. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // 4. Phone - exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    // 5. Date of Birth - must be in past (before today)
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time
      if (dob >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    // 6. Password constraints (SAME AS LOGIN)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain lowercase letter';
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must contain a number';
      } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain special character';
      }
    }

    // 7. Password match
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8081/api/public/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if (response.ok) {
  setShowSuccessDialog(true);  // Show dialog
  setTimeout(() => {
    setShowSuccessDialog(false);
    navigate('/login');  // Auto-redirect after 2s
  }, 2000);
}
      } else {
        let errorMessage = 'Signup failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        setErrors({ server: errorMessage });
      }
    } catch (err) {
      setErrors({ server: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-capitalize full name
    const processedValue = name === 'fullName' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    
    setFormData({ ...formData, [name]: processedValue });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
    if (errors.gender) {
      setErrors({ ...errors, gender: '' });
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <h1 className="hospital-title">HospitalCare</h1>
          <p className="welcome-text">Create Patient Account</p>
          
          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name */}
            <div className="input-group">
              <label>Full Name *</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              {errors.fullName && <span className="error">{errors.fullName}</span>}
            </div>

            {/* Username */}
            <div className="input-group">
              <label>Username *</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose unique username"
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            {/* Email & Phone */}
            <div className="input-row">
              <div className="input-group half">
                <label>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="input-group half">
                <label>Phone *</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
            </div>

            {/* Gender & Date of Birth */}
            <div className="input-row">
              <div className="input-group half">
                <label>Gender *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={formData.gender === 'MALE'}
                      onChange={() => handleGenderChange('MALE')}
                    />
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={formData.gender === 'FEMALE'}
                      onChange={() => handleGenderChange('FEMALE')}
                    />
                    Female
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="OTHER"
                      checked={formData.gender === 'OTHER'}
                      onChange={() => handleGenderChange('OTHER')}
                    />
                    Other
                  </label>
                </div>
                {errors.gender && <span className="error">{errors.gender}</span>}
              </div>
              <div className="input-group half">
                <label>Date of Birth *</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="input-row">
              <div className="input-group half">
                <label>Password *</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 chars with uppercase, lowercase, number, special"
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
              <div className="input-group half">
                <label>Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {errors.server && <div className="error-message">{errors.server}</div>}

            <button type="submit" disabled={loading} className="signup-btn">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
          {showSuccessDialog && (
  <div className="success-dialog-overlay">
    <div className="success-dialog">
      <div className="success-icon">✅</div>
      <h3>Account Created Successfully!</h3>
      <p>Redirecting to login...</p>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default Signup;
