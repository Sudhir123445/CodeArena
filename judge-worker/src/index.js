const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Worker is healthy' });
});

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`🚀 Judge Worker running on http://localhost:${PORT}`);
});
