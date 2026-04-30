import React, { useState } from 'react';
import API from '../api';

export default function Verify() {
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/identities/verify', { payload });
      setResult(res.data);
    } catch (err) {
      setResult({ result: 'ERROR', message: err.response?.data?.error || 'Verification failed' });
    }
    setLoading(false);
  };

  const getColor = (r) => ({ SUCCESS:'#2d6a4f', REVOKED:'#c1121f', NOT_FOUND:'#e67e22', ERROR:'#c1121f' }[r] || '#333');

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Verify Identity</h2>
      <p style={styles.subtitle}>Enter the QR payload manually to verify an identity</p>
      <form onSubmit={handleVerify} style={styles.form}>
        <label style={styles.label}>QR Payload</label>
        <input style={styles.input} placeholder="e.g. TXID:abc123|RID:1" value={payload} onChange={e => setPayload(e.target.value)} required />
        <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify Identity'}</button>
      </form>
      {result && (
        <div style={{...styles.resultCard, borderColor: getColor(result.result)}}>
          <h3 style={{color: getColor(result.result)}}>
            {result.result === 'SUCCESS' ? '✅' : result.result === 'REVOKED' ? '🚫' : '❌'} {result.result}
          </h3>
          <p>{result.message}</p>
          {result.registeredAt && <p><strong>Registered:</strong> {new Date(result.registeredAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth:'500px', margin:'0 auto', padding:'24px' },
  title: { color:'#1a1a2e' },
  subtitle: { color:'#666', marginBottom:'24px' },
  form: { display:'flex', flexDirection:'column' },
  label: { fontWeight:'600', marginBottom:'6px' },
  input: { padding:'12px', marginBottom:'16px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' },
  button: { padding:'12px', background:'#4361ee', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  resultCard: { marginTop:'24px', padding:'24px', borderRadius:'12px', border:'2px solid', textAlign:'center' },
};
