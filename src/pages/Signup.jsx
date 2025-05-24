import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';


const sentence = "The quick brown fox jumps over a lazy dog while vexing bright jumpy wizards.";

// Normalize vector
const normalize = (vector) => {
  const mean = vector.reduce((a, b) => a + b, 0) / vector.length;
  const std = Math.sqrt(vector.reduce((sum, val) => sum + (val - mean) ** 2, 0) / vector.length);
  return vector.map(v => (v - mean) / (std || 1));
};

// Cap extreme values in vector
const capOutliers = (vector, capValue = 3000) => {
  return vector.map(val => Math.max(Math.min(val, capValue), -capValue));
};

// Compute median vector from 3 attempts
const computeMedianVector = (vectors) => {
  const length = vectors[0].length;
  const medianVector = [];

  for (let i = 0; i < length; i++) {
    const valuesAtI = vectors.map(vec => vec[i]).sort((a, b) => a - b);
    const mid = Math.floor(valuesAtI.length / 2);
    const median = valuesAtI.length % 2 === 0
      ? (valuesAtI[mid - 1] + valuesAtI[mid]) / 2
      : valuesAtI[mid];
    medianVector.push(median);
  }

  return medianVector;
};

const TypingForm = ({ onSubmit }) => {
  const [keystrokes, setKeystrokes] = useState([]);
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(null);

  const handleKeyDown = (e) => {
    const time = Date.now();
    if (!startTime) setStartTime(time);

    if (e.key === 'Backspace') {
      setKeystrokes((prev) => prev.slice(0, -1));
      return;
    }

    const nextExpectedChar = sentence[text.length];
    if (e.key === nextExpectedChar) {
      setKeystrokes((prev) => [...prev, { key: e.key, time }]);
    }
  };

  const handleChange = (e) => {
    const typed = e.target.value;
    const expected = sentence.slice(0, typed.length);
    if (typed === expected && typed.length <= sentence.length) {
      setText(typed);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (text !== sentence) {
      alert("Please complete the sentence exactly before submitting.");
      return;
    }

    const diffs = [];
    for (let i = 1; i < keystrokes.length; i++) {
      diffs.push(keystrokes[i].time - keystrokes[i - 1].time);
    }

    const cappedDiffs = capOutliers(diffs);
    onSubmit(cappedDiffs);

    setKeystrokes([]);
    setText('');
    setStartTime(null);
  };

  return (
    <div>
      <p>Please type: <strong>{sentence}</strong></p>
      <input
        type="text"
        style={styles.input}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        required
      />
      <button
        type="button"
        onClick={handleSubmit}
        style={styles.button}
        disabled={text !== sentence}
      >
        Submit Attempt
      </button>
    </div>
  );
};

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [typingVectors, setTypingVectors] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleTypingAttempt = (vector) => {
    setTypingVectors((prev) => [...prev, vector]);
    if (currentAttempt < 3) setCurrentAttempt(currentAttempt + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) return alert("Passwords do not match.");
    if (typingVectors.length !== 3) return alert("Please complete all 3 typing samples.");
  
    const medianVector = computeMedianVector(typingVectors);
    const cappedVector = capOutliers(medianVector);
    const normalizedVector = normalize(cappedVector);
  
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      const { error } = await supabase.from('users').insert([{
        full_name: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password: hashedPassword, 
        typing_vector: normalizedVector,
      }]);
  
      if (error) {
        alert('Signup failed: ' + error.message);
      } else {
        setMessage("Redirecting...");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  };  

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title1}>Create a New Account</h2>

        <input
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          style={styles.input}
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {typingVectors.length < 3 ? (
          <TypingForm onSubmit={handleTypingAttempt} />
        ) : (
          <button type="submit" style={styles.button}>
            Sign Up
          </button>
        )}

        <p style={styles.redirectMessage}>{message}</p>
      </form>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    fontFamily: 'Jost, sans-serif',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    gap: '1rem',
  },
  title1: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid #ccc',
    fontSize: '14px',
    fontFamily: 'Jost, sans-serif',
    fontWeight: '500',
  },
  button: {
    padding: '0.75rem 1rem',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#ff8da1',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
  },
  redirectMessage: {
    fontSize: '12px',
    color: '#7A6BB7',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
};

export default Signup;