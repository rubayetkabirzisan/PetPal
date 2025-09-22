const express = require('express');
const router = express.Router();
const LostPet = require('../models/LostPet');
const Pet = require('../models/Pet');
const User = require('../models/User');

// Middleware for admin authentication
const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'shelter_staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// GET /api/admin-lost-pets - Get all lost pets for admin management
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      search = '',
      sortBy = 'reportedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Filter by status
    if (status !== 'all') {
      filter.status = status;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { petName: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { lastKnownLocation: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [lostPets, totalCount] = await Promise.all([
      LostPet.find(filter)
        .populate('reportedBy', 'name email phone')
        .populate('pet', 'name breed age images')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LostPet.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Get statistics
    const statistics = await LostPet.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: totalCount,
      missing: 0,
      found: 0,
      reunited: 0,
      closed: 0
    };

    statistics.forEach(stat => {
      stats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        lostPets: lostPets.map(pet => ({
          id: pet._id,
          petName: pet.petName,
          breed: pet.breed,
          age: pet.age,
          status: pet.status,
          statusDisplay: pet.status.charAt(0).toUpperCase() + pet.status.slice(1),
          reportedAt: pet.reportedAt,
          lastKnownLocation: pet.lastKnownLocation,
          description: pet.description,
          images: pet.images || [],
          reportedBy: pet.reportedBy ? {
            id: pet.reportedBy._id,
            name: pet.reportedBy.name,
            email: pet.reportedBy.email,
            phone: pet.reportedBy.phone
          } : null,
          pet: pet.pet,
          priority: pet.priority || 'medium',
          rewardOffered: pet.rewardOffered || 0,
          lastSightingDate: pet.lastSightingDate,
          microchipId: pet.microchipId
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        statistics: stats,
        filters: {
          status,
          search,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lost pets for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lost pets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin-lost-pets/:id - Get specific lost pet details
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const lostPet = await LostPet.findById(req.params.id)
      .populate('reportedBy', 'name email phone address')
      .populate('pet', 'name breed age images microchipId')
      .populate('sightings.reportedBy', 'name email phone')
      .lean();

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }

    res.json({
      success: true,
      data: {
        lostPet: {
          id: lostPet._id,
          petName: lostPet.petName,
          breed: lostPet.breed,
          age: lostPet.age,
          status: lostPet.status,
          reportedAt: lostPet.reportedAt,
          lastKnownLocation: lostPet.lastKnownLocation,
          description: lostPet.description,
          images: lostPet.images || [],
          reportedBy: lostPet.reportedBy,
          pet: lostPet.pet,
          priority: lostPet.priority || 'medium',
          rewardOffered: lostPet.rewardOffered || 0,
          lastSightingDate: lostPet.lastSightingDate,
          microchipId: lostPet.microchipId,
          sightings: lostPet.sightings || [],
          searchRadius: lostPet.searchRadius || 5,
          specialInstructions: lostPet.specialInstructions,
          createdAt: lostPet.createdAt,
          updatedAt: lostPet.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lost pet details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lost pet details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/admin-lost-pets/:id/status - Update lost pet status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['missing', 'found', 'reunited', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: missing, found, reunited, or closed'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'found' && !req.body.foundDate) {
      updateData.foundDate = new Date();
    } else if (req.body.foundDate) {
      updateData.foundDate = new Date(req.body.foundDate);
    }

    if (status === 'reunited' && !req.body.reunitedDate) {
      updateData.reunitedDate = new Date();
    } else if (req.body.reunitedDate) {
      updateData.reunitedDate = new Date(req.body.reunitedDate);
    }

    if (notes) {
      updateData.$push = {
        adminNotes: {
          note: notes,
          adminId: req.user.id,
          timestamp: new Date()
        }
      };
    }

    const lostPet = await LostPet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }

    res.json({
      success: true,
      message: `Lost pet status updated to ${status}`,
      data: {
        lostPet: {
          id: lostPet._id,
          status: lostPet.status,
          foundDate: lostPet.foundDate,
          reunitedDate: lostPet.reunitedDate,
          updatedAt: lostPet.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error updating lost pet status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lost pet status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/admin-lost-pets/:id/priority - Update lost pet priority
router.put('/:id/priority', requireAdmin, async (req, res) => {
  try {
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be: low, medium, high, or critical'
      });
    }

    const lostPet = await LostPet.findByIdAndUpdate(
      req.params.id,
      { priority, updatedAt: new Date() },
      { new: true }
    );

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }

    res.json({
      success: true,
      message: `Priority updated to ${priority}`,
      data: {
        lostPet: {
          id: lostPet._id,
          priority: lostPet.priority,
          updatedAt: lostPet.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error updating lost pet priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update priority',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/admin-lost-pets/:id/notes - Add admin note to lost pet report
router.post('/:id/notes', requireAdmin, async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const lostPet = await LostPet.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          adminNotes: {
            note: note.trim(),
            adminId: req.user.id,
            adminName: req.user.name,
            timestamp: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }

    const newNote = lostPet.adminNotes[lostPet.adminNotes.length - 1];

    res.json({
      success: true,
      message: 'Admin note added successfully',
      data: {
        note: newNote
      }
    });
  } catch (error) {
    console.error('Error adding admin note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/admin-lost-pets/:id - Delete lost pet report (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const lostPet = await LostPet.findByIdAndDelete(req.params.id);

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: 'Lost pet report not found'
      });
    }

    res.json({
      success: true,
      message: 'Lost pet report deleted successfully',
      data: {
        deletedId: req.params.id
      }
    });
  } catch (error) {
    console.error('Error deleting lost pet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lost pet report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;