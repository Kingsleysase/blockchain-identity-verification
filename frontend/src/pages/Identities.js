import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Identities() {
  const [identities, setIdentities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/identities').then(res => {
      setIdentities(res.data.identities);
      setLoading(false);
    });
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this identity?')) return;
    await API.patch(`/identities/${id}/revoke`);
    setIdentities(identities.map(i => i.identity_id === id ? {...i, status:'REVOKED'} : i));
    setSelected(null);
  };

  const fetchDetails = async (id) => {
    const res = await API.get(`/identities/${id}`);
    setSelected(res.data.identity);
  };

  if (loading) return <p style={{padding:'24px'}}>Loading identities...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Registered Identities</h2>
      {identities.length === 0 ? <p>No identities registered yet.</p> : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Transaction ID</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Registered</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {identities.map(i => (
              <tr key={i.identity_id} style={styles.tr}>
                <td style={styles.td}>{i.identity_id}</td>
                <td style={styles.td}>{i.blockchain_transaction_id?.substring(0,16)}...</td>
                <td style={styles.td}>
                  <span style={{...styles.badge, background: i.status === 'ACTIVE' ? '#2d6a4f' : '#c1121f'}}>{i.status}</span>
                </td>
                <td style={styles.td}>{new Date(i.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button style={styles.viewBtn} onClick={() => fetchDetails(i.identity_id)}>View QR</button>
                  {i.status === 'ACTIVE' && <button style={styles.revokeBtn} onClick={() => handleRevoke(i.identity_id)}>Revoke</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Identity Details</h3>
            <p><strong>Status:</strong> {selected.status}</p>
            <p><strong>Transaction ID:</strong> {selected.blockchain_transaction_id}</p>
            <p><strong>Registered:</strong> {selected.created_at}</p>
            {selected.qr_code_data && <img src={selected.qr_code_data} alt="QR" style={{width:'200px'}} />}
            <br/>
            <button style={styles.viewBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding:'24px' },
  title: { color:'#1a1a2e', marginBottom:'24px' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#4361ee', color:'#fff' },
  th: { padding:'12px', textAlign:'left' },
  tr: { borderBottom:'1px solid #eee' },
  td: { padding:'12px' },
  badge: { color:'#fff', padding:'4px 10px', borderRadius:'12px', fontSize:'12px' },
  viewBtn: { padding:'6px 12px', background:'#4361ee', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'8px' },
  revokeBtn: { padding:'6px 12px', background:'#c1121f', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' },
  modal: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center' },
  modalContent: { background:'#fff', padding:'32px', borderRadius:'12px', textAlign:'center', maxWidth:'400px' },
};
