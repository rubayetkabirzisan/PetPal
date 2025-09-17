const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// Define UserProfile Schema and Model
const userProfileSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  location: String,
  bio: String
}, { timestamps: true })

const UserProfile = mongoose.model('UserProfile', userProfileSchema)

// Get user profile
router.get('/view/:uid', async (req, res) => {
  try {
    const { uid } = req.params
    const profile = await UserProfile.findOne({ uid })

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user profile
router.put('/update/:uid', async (req, res) => {
  try {
    const { uid } = req.params
    const updated = await UserProfile.findOneAndUpdate(
      { uid },
      { ...req.body },
      { new: true, upsert: true }
    )
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error })
  }
})

// // Create a new user profile
// router.post('/addNew', async (req, res) => {
//   try {
//     const { uid, name, email, phone, location, bio } = req.body

//     // Check if the user already exists
//     const existingUser = await UserProfile.findOne({ uid })
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' })
//     }

//     // Create a new user profile
//     const newProfile = new UserProfile({
//       uid,
//       name,
//       email,
//       phone,
//       location,
//       bio
//     })

//     // Save the new user profile to the database
//     await newProfile.save()

//     res.status(201).json(newProfile)
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to create profile', error })
//   }
// })

module.exports = router
//adopyter profile screen