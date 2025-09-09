// Dummy backend for PetPal admin operations
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

// Dummy endpoint for admin dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    totalUsers: 150,
    totalPets: 60,
    activeSessions: 12,
    pendingRequests: 7
  });
});

// Dummy endpoint for approving adoption requests
app.post('/api/admin/approve', (req, res) => {
  const { requestId } = req.body;
  res.json({ success: true, message: `Request ${requestId} approved.` });
});

app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
});
