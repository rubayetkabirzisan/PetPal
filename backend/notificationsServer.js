// Dummy backend for PetPal notifications
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Dummy notifications endpoint
app.get('/api/notifications', (req, res) => {
  res.json([
    { id: 1, message: 'Your pet profile was updated.' },
    { id: 2, message: 'New adoption request received.' }
  ]);
});

// Dummy POST endpoint for sending notification
app.post('/api/notifications', (req, res) => {
  const { message } = req.body;
  res.json({ success: true, message: `Notification sent: ${message}` });
});

app.listen(PORT, () => {
  console.log(`Notifications backend running on port ${PORT}`);
});
