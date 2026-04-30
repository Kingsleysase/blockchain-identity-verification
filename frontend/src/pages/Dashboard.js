import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });

  useEffect(() => {
    API.get('/identities').then(res => {
      const identities = res.data.identities;
      setStats({
        total: identities.length,
        active: identities.filter(i => i.status === 'ACTIVE').length,
        revoked: identities.filter(i => i.status === 'REVOKED').length,
      });
    });
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>
      <p style={styles.subtitle}>Overview of the Identity Verification System</p>
      <div style={styles.cards}>
        <div style={{...styles.card, background:'#4361ee'}}>
          <h1 style={styles.num}>{stats.total}</h1>
          <p style={styles.cardLabel}>Total Identities</p>
        </div>
        <div style={{...styles.card, background:'#2d6a4f'}}>
          <h1 style={styles.num}>{stats.active}</h1>
          <p style={styles.cardLabel}>Active</p>
        </div>
        <div style={{...styles.card, background:'#c1121f'}}>
          <h1 style={styles.num}>{stats.revoked}</h1>
          <p style={styles.cardLabel}>Revoked</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding:'24px' },
  title: { color:'#1a1a2e' },
  subtitle: { color:'#666', marginBottom:'32px' },
  cards: { display:'flex', gap:'24px', flexWrap:'wrap' },
  card: { padding:'32px', borderRadius:'12px', color:'#fff', minWidth:'160px', textAlign:'center' },
  num: { fontSize:'48px', margin:0 },
  cardLabel: { margin:'8px 0 0', fontSize:'16px' },
};
