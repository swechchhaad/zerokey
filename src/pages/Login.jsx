import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';


const sentence = "The quick brown fox jumps over a lazy dog while vexing bright jumpy wizards.";

const normalize = (vector) => {
  const mean = vector.reduce((a, b) => a + b, 0) / vector.length;
  const std = Math.sqrt(vector.reduce((sum, val) => sum + (val - mean) ** 2, 0) / vector.length);
  return vector.map(v => (v - mean) / (std || 1));
};

const capOutliers = (vector, capValue = 3000) => {
  return vector.map(val => Math.max(Math.min(val, capValue), -capValue));
};

const TypingForm = ({ username, onAuthenticate }) => {
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

  const handleSubmit = async () => {
    if (text !== sentence) {
      alert("Please type the sentence exactly.");
      return;
    }

    const diffs = [];
    for (let i = 1; i < keystrokes.length; i++) {
      diffs.push(keystrokes[i].time - keystrokes[i - 1].time);
    }

    const capped = capOutliers(diffs);
    const normalized = normalize(capped);

    const { data, error } = await supabase
      .from('users')
      .select('typing_vector')
      .eq('username', username)
      .single();

    if (error || !data) {
      alert("User not found.");
      return;
    }

    const stored = data.typing_vector;
    if (!stored || stored.length !== normalized.length) {
      console.warn("Length mismatch", stored.length, normalized.length);
      return alert("Stored typing pattern is invalid or incomplete.");
    }

    const diffsVec = normalized.map((v, i) => v - stored[i]);
    const rmse = Math.sqrt(diffsVec.reduce((sum, d) => sum + d ** 2, 0) / diffsVec.length);

    console.log("RMSE:", rmse.toFixed(4));
    if (rmse <= 1.2) {
      onAuthenticate();
    } else {
      alert(`Typing pattern mismatch.\nRMSE: ${rmse.toFixed(4)}`);
    }
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
      <button type="button" onClick={handleSubmit} style={styles.button} disabled={text !== sentence}>
        Verify Typing
      </button>
    </div>
  );
};

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { data, error } = await supabase
      .from('users')
      .select('password')
      .eq('username', name.trim())
      .single();
  
    if (error || !data) return alert("No user found.");
  
    const match = bcrypt.compareSync(password, data.password);
    if (!match) return alert("Incorrect password.");
  
    setStep(2); 
  };
  
  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title1}>Login</h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        {step === 1 ? (
          <>
            <button type="submit" style={styles.button}>Sign In</button>
            <p style={styles.redirectMessage}>
              Don’t have an account?{" "}
              <span
                style={{ fontWeight: 'bold', color: '#7A6BB7', cursor: 'pointer' }}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </span>
            </p>
          </>
        ) : (
          <TypingForm username={name.trim()} onAuthenticate={() => navigate('/home')} />
        )}
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

export default Login;