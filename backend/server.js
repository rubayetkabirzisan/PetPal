// Dummy Express.js backend server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Dummy endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend is running', time: new Date() });
});

// Dummy users endpoint
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
