const express = require('express');
const router = express.Router();
const VerificationRequest = require('../models/VerificationRequest');

// Get all verification requests (Admin only)
router.get('/', async (req, res) => {
  try {
    const requests = await VerificationRequest.find().sort({ submissionDate: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching verification requests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get verification request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await VerificationRequest.findOne({ requestId: req.params.id });
    if (!request) {
      return res.status(404).json({ message: 'Verification request not found' });
    }
    res.json(request);
  } catch (err) {
    console.error('Error fetching verification request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Submit new verification request
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      userInfo,
      verificationType,
      documents,
      businessInfo
    } = req.body;

    const newRequest = new VerificationRequest({
      requestId: `vr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userInfo,
      verificationType,
      documents: documents || [],
      businessInfo: businessInfo || {}
    });

    await newRequest.save();
    res.status(201).json({
      message: 'Verification request submitted successfully',
      request: newRequest
    });
  } catch (err) {
    console.error('Error creating verification request:', err);
    res.status(400).json({ message: 'Error creating verification request', error: err.message });
  }
});

// Update verification request status (Admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, reviewNotes, rejectionReason, reviewedBy } = req.body;
    
    const updateData = {
      status,
      reviewedDate: new Date(),
      reviewedBy,
      reviewNotes: reviewNotes || '',
      ...(status === 'rejected' && { rejectionReason: rejectionReason || '' })
    };

    const request = await VerificationRequest.findOneAndUpdate(
      { requestId: req.params.id },
      updateData,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    res.json({
      message: `Verification request ${status} successfully`,
      request
    });
  } catch (err) {
    console.error('Error updating verification request:', err);
    res.status(400).json({ message: 'Error updating verification request', error: err.message });
  }
});

// Get verification requests by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await VerificationRequest.find({ userId: req.params.userId })
      .sort({ submissionDate: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching user verification requests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get verification statistics (Admin only)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      VerificationRequest.countDocuments({ status: 'pending' }),
      VerificationRequest.countDocuments({ status: 'approved' }),
      VerificationRequest.countDocuments({ status: 'rejected' }),
      VerificationRequest.countDocuments({ status: 'needs_review' })
    ]);

    res.json({
      pending: stats[0],
      approved: stats[1],
      rejected: stats[2],
      needsReview: stats[3],
      total: stats.reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    console.error('Error fetching verification statistics:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
