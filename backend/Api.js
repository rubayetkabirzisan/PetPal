// Dummy backend API for PetPal
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Dummy pets endpoint
app.get('/api/pets', (req, res) => {
  res.json([
    { id: 1, name: 'Buddy', type: 'Dog' },
    { id: 2, name: 'Mittens', type: 'Cat' }
  ]);
});

// Dummy adoption endpoint
app.post('/api/adopt', (req, res) => {
  const { petId, userId } = req.body;
  res.json({ success: true, message: `User ${userId} adopted pet ${petId}` });
});

app.listen(PORT, () => {
  console.log(`Dummy backend running on port ${PORT}`);
});
