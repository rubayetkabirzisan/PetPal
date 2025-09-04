// Dummy backend for PetPal project update
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Dummy endpoint for pets
app.get('/api/pets', (req, res) => {
  res.json([
    { id: 1, name: 'Charlie', type: 'Dog' },
    { id: 2, name: 'Luna', type: 'Cat' }
  ]);
});

// Dummy endpoint for users
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

// Dummy POST endpoint for adoption
app.post('/api/adopt', (req, res) => {
  const { petId, userId } = req.body;
  res.json({ success: true, message: `User ${userId} adopted pet ${petId}` });
});

app.listen(PORT, () => {
  console.log(`Dummy backend running on port ${PORT}`);
});
