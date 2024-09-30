import React, { useState } from 'react';
import { auth, database } from '../firebase';  // Adjust the path accordingly
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true); // Show loading icon when registration starts
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        saveUserData(user.uid, fullName, email, phoneNumber);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false); // Hide loading on error
      });
  };

  const saveUserData = (userId, fullName, email, phoneNumber) => {
    set(ref(database, 'users/' + userId), {
      fullName: fullName,
      email: email,
      phoneNumber: phoneNumber,
    })
      .then(() => {
        setLoading(false); // Hide loading on success
        alert('Berhasil mendaftar!');
        navigate('/');
      })
      .catch((error) => {
        console.error('Error saving user data:', error);
        setError('Gagal menyimpan data pengguna.');
        setLoading(false); // Hide loading on error
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="register-container" style={{ position: 'relative' }}>
      {loading && (
        <div className="loading-container">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/pusatbayar-innoview.appspot.com/o/InnoView-loading-icon.png?alt=media&token=8544f63b-cf61-46c9-b23a-03300e939813"
            alt="Loading..."
            className="loading-icon"
          />
        </div>
      )}
      <h2>Register</h2>
      <div className="form-container">
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="No Telpon (WhatsApp)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <button type="submit">Register</button>
        </form>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Register;
