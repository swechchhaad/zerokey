import React from "react";

const Home = () => {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Congratulations! 🎉</h1>
        <p style={styles.subtitle}>You have successfully authenticated using your typing pattern.</p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#ffffff',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Jost, sans-serif',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#fdf6fd',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#9A031E',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '16px',
    color: '#333333',
  },
};

export default Home;