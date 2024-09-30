import React, { useState } from 'react';
import { auth } from '../firebase';  // Adjust the path accordingly
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for navigation
import './Auth.css'; // CSS for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Logged in:', user);
        setShowPopup(true);
        setTimeout(() => {
          setLoading(false);
          navigate('/'); // Redirect after a successful login
        }, 2000);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container" style={{ position: 'relative' }}>
      {loading && (
        <div className="loading-container">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/pusatbayar-innoview.appspot.com/o/InnoView-loading-icon.png?alt=media&token=8544f63b-cf61-46c9-b23a-03300e939813"
            alt="Loading..."
            className="loading-icon"
          />
        </div>
      )}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="inputField"
            required
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputField"
              required
            />
            <span
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '30px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
              }}
            >
              {showPassword ? '🙉' : '🙈'}
            </span>
          </div>
          <button type="submit">Login</button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      {showPopup && (
        <div className="popup">
          <p>Login successful! Redirecting...</p>
        </div>
      )}

      {/* Add the green-colored text and gray, semi-transparent button */}
      <p style={{ color: 'green', marginTop: '20px' }}>
        Belum punya Akun? buat lebih dulu yuk... 
        <Link to="/register">
          <button style={{
            backgroundColor: 'gray',
            color: 'white',
            opacity: '0.6', // Faded appearance
            cursor: 'pointer',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px'
          }}>
            Register
          </button>
        </Link>
      </p>
    </div>
  );
};

export default Login;
