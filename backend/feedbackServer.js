// Dummy backend for PetPal feedback
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Dummy feedback endpoint
app.get('/api/feedback', (req, res) => {
  res.json([
    { id: 1, user: 'Alice', feedback: 'Great app!' },
    { id: 2, user: 'Bob', feedback: 'Needs more features.' }
  ]);
});

// Dummy POST endpoint for submitting feedback
app.post('/api/feedback', (req, res) => {
  const { user, feedback } = req.body;
  res.json({ success: true, message: `Feedback received from ${user}` });
});

app.listen(PORT, () => {
  console.log(`Feedback backend running on port ${PORT}`);
});
