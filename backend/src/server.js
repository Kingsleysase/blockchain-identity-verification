require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createTables } = require('./db/schema');

const authRoutes = require('./routes/auth');
const identityRoutes = require('./routes/identities');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/identities', identityRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server is running' }));

const PORT = process.env.PORT || 5000;

const start = async () => {
  await createTables();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch(console.error);
