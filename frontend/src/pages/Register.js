import React, { useState } from 'react';
import API from '../api';

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ nin: '', fullName: '', dob: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/identities', form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register New Identity</h2>
      {!result ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>NIN</label>
          <input style={styles.input} placeholder="Enter NIN" value={form.nin} onChange={e => setForm({...form, nin: e.target.value})} required />
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} placeholder="Enter full name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          <label style={styles.label}>Date of Birth</label>
          <input style={styles.input} type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Identity'}</button>
        </form>
      ) : (
        <div style={styles.successCard}>
          <h3 style={{color:'#2d6a4f'}}>✅ Identity Registered Successfully!</h3>
          <p><strong>Transaction ID:</strong> {result.blockchain.transactionId}</p>
          <p><strong>Block Index:</strong> {result.blockchain.blockIndex}</p>
          <p><strong>Status:</strong> {result.identity.status}</p>
          <p><strong>QR Code:</strong></p>
          <img src={result.identity.qr_code_data} alt="QR Code" style={{width:'200px', height:'200px'}} />
          <br/>
          <button style={styles.button} onClick={() => { setResult(null); setForm({nin:'',fullName:'',dob:''}); }}>Register Another</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth:'500px', margin:'0 auto', padding:'24px' },
  title: { color:'#1a1a2e', marginBottom:'24px' },
  form: { display:'flex', flexDirection:'column' },
  label: { fontWeight:'600', marginBottom:'6px', color:'#333' },
  input: { padding:'12px', marginBottom:'16px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' },
  button: { padding:'12px', background:'#4361ee', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', marginTop:'8px' },
  error: { color:'red', marginBottom:'12px' },
  successCard: { background:'#d8f3dc', padding:'24px', borderRadius:'12px', textAlign:'center' },
};
