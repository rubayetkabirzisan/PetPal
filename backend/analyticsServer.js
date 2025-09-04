// Dummy backend for PetPal analytics
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Dummy analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    totalUsers: 120,
    totalPets: 45,
    adoptions: 30,
    lostPets: 5
  });
});

// Dummy POST endpoint for reporting lost pet
app.post('/api/lost-pet', (req, res) => {
  const { petId, description } = req.body;
  res.json({ success: true, message: `Lost pet report received for pet ${petId}` });
});

app.listen(PORT, () => {
  console.log(`Analytics backend running on port ${PORT}`);
});
