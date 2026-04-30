import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Identities from './pages/Identities';
import Verify from './pages/Verify';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { localStorage.clear(); setUser(null); };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <h3 style={styles.brand}>🔐 IVS</h3>
          <p style={styles.welcome}>Hello, {user.username}</p>
          <nav>
            <Link style={styles.link} to="/">Dashboard</Link>
            <Link style={styles.link} to="/register">Register Identity</Link>
            <Link style={styles.link} to="/identities">All Identities</Link>
            <Link style={styles.link} to="/verify">Verify Identity</Link>
          </nav>
          <button style={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
        <div style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/identities" element={<Identities />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  layout: { display:'flex', height:'100vh', fontFamily:'Segoe UI, sans-serif' },
  sidebar: { width:'220px', background:'#1a1a2e', color:'#fff', padding:'24px', display:'flex', flexDirection:'column' },
  brand: { color:'#4361ee', fontSize:'20px', marginBottom:'8px' },
  welcome: { fontSize:'13px', color:'#aaa', marginBottom:'32px' },
  link: { display:'block', color:'#fff', textDecoration:'none', padding:'10px 0', borderBottom:'1px solid #2a2a4a', fontSize:'14px' },
  main: { flex:1, overflow:'auto', background:'#f0f2f5' },
  logout: { marginTop:'auto', padding:'10px', background:'#c1121f', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
};
