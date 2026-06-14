import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';


const validatePassword = (password) => {
  const minLength = /.{8,}/;
  const uppercase = /[A-Z]/;
  const lowercase = /[a-z]/;
  const digit = /\d/;
  const special = /[!@#$%^&*(),.?":{}|<>]/;
  
  if (!minLength.test(password)) return "Password must be at least 8 characters";
  if (!uppercase.test(password)) return "Password must contain at least one uppercase letter";
  if (!lowercase.test(password)) return "Password must contain at least one lowercase letter";
  if (!digit.test(password)) return "Password must contain at least one digit";
  if (!special.test(password)) return "Password must contain at least one special character";

  return "";
};



const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState("");

const handlePasswordChange = (e) => {
  const pwd = e.target.value;
  setCredentials({ ...credentials, password: pwd });

  const errorMsg = validatePassword(pwd);
  setPasswordError(errorMsg);
};


  // Image slider state
  const images = ['/h1.jpg', '/h2.jpg', '/h3.jpg', '/h4.jpeg', '/h5.jpeg'];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Image slide changes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.login(credentials);
      login(response.data.token, response.data.role);
      
      if (response.data.role === 'PATIENT') navigate('/patient/dashboard');
      else if (response.data.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (response.data.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Half - Login Form */}
      <div className="login-left">
        <div className="login-card">
          <h1 className="hospital-title">HospitalCare</h1>
          <p className="welcome-text">Welcome back</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
  type="password"
  value={credentials.password}
  onChange={handlePasswordChange}
  placeholder="Enter password"
  required
/>
{passwordError && <div className="error-message">{passwordError}</div>}

            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button
  type="submit"
  disabled={loading || passwordError !== ""}
  className="login-btn"
>
  {loading ? 'Signing in...' : 'Sign In'}
</button>

          </form>
          
          <div className="signup-link">
            <p>New user? <Link to="/signup">Create an account</Link></p>
          </div>
          
          {/* <div className="test-users">
            <p><strong>Test users:</strong></p>
            <p>patient1/patientpass → Patient</p>
            <p>doctor1/doctorpass → Doctor</p>
            <p>admin1/adminpass → Admin</p>
          </div> */}

          {/* Replace test-users div with this social icons div */}
<div className="social-links">
  <a href="mailto:info@hospitalcare.com" className="social-icon" title="Email Us" aria-label="Email">
    <i className="fas fa-envelope"></i>
  </a>
  <a href="https://instagram.com/hospitalcare" target="_blank" rel="noreferrer" className="social-icon" title="Instagram">
    <i className="fab fa-instagram"></i>
  </a>
  <a href="tel:+919876543210" className="social-icon" title="Call Us" aria-label="Phone">
    <i className="fas fa-phone"></i>
  </a>
  <a href="https://linkedin.com/company/hospitalcare" target="_blank" rel="noreferrer" className="social-icon" title="LinkedIn">
    <i className="fab fa-linkedin"></i>
  </a>
</div>


        </div>
      </div>

      {/* Right Half - Image Scroll Only */}
      <div className="login-right">
        <div className="image-slider">
          <div 
            className="slides" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="slide" style={{ backgroundImage: `url(${img})` }}></div>
            ))}
          </div>
        </div>
        <div className="curve-overlay"></div>
      </div>
    </div>
  );
};

export default Login;
