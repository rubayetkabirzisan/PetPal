// routes/petRoutes.js
const express = require("express");
const Pet = require("../models/Pet");
const router = express.Router();

// Get all pets with filtering and pagination
router.get("/view", async (req, res) => {
  try {
    const { 
      species, 
      age, 
      size, 
      gender, 
      adoptionStatus, 
      city, 
      state,
      page = 1, 
      limit = 20,
      search
    } = req.query;
    
    let filter = {};
    
    if (species) filter.species = species;
    if (age) filter.age = { $lte: parseInt(age) };
    if (size) filter.size = size;
    if (gender) filter.gender = gender;
    if (adoptionStatus) filter.adoptionStatus = adoptionStatus;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { breed: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const pets = await Pet.find(filter)
      .sort({ dateAdded: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Pet.countDocuments(filter);
    
    res.json({
      pets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ error: "Error fetching pets", message: err.message });
  }
});

// Get pet by ID
router.get("/:petId", async (req, res) => {
  try {
    const pet = await Pet.findOne({ petId: req.params.petId });
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.json(pet);
  } catch (err) {
    console.error('Error fetching pet:', err);
    res.status(500).json({ error: "Error fetching pet", message: err.message });
  }
});

// Add a new pet
router.post("/addpet", async (req, res) => {
  try {
    const petData = {
      ...req.body,
      petId: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date(),
      lastUpdated: new Date()
    };
    
    const newPet = new Pet(petData);
    await newPet.save();
    res.status(201).json({
      message: "Pet added successfully",
      pet: newPet
    });
  } catch (err) {
    console.error('Error adding pet:', err);
    res.status(500).json({ error: "Error adding pet", message: err.message });
  }
});

// Update a pet's information
router.put("/:petId", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdated: new Date()
    };
    
    const updatedPet = await Pet.findOneAndUpdate(
      { petId: req.params.petId }, 
      updateData, 
      { new: true }
    );
    
    if (!updatedPet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    
    res.json({
      message: "Pet updated successfully",
      pet: updatedPet
    });
  } catch (err) {
    console.error('Error updating pet:', err);
    res.status(500).json({ error: "Error updating pet", message: err.message });
  }
});

// Update pet adoption status
router.put("/:petId/status", async (req, res) => {
  try {
    const { adoptionStatus } = req.body;
    
    const updatedPet = await Pet.findOneAndUpdate(
      { petId: req.params.petId },
      { 
        adoptionStatus,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!updatedPet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    
    res.json({
      message: `Pet status updated to ${adoptionStatus}`,
      pet: updatedPet
    });
  } catch (err) {
    console.error('Error updating pet status:', err);
    res.status(500).json({ error: "Error updating pet status", message: err.message });
  }
});

// Delete a pet
router.delete("/:petId", async (req, res) => {
  try {
    const deletedPet = await Pet.findOneAndDelete({ petId: req.params.petId });
    
    if (!deletedPet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (err) {
    console.error('Error deleting pet:', err);
    res.status(500).json({ error: "Error deleting pet", message: err.message });
  }
});

// Get pets by shelter
router.get("/shelter/:shelterId", async (req, res) => {
  try {
    const pets = await Pet.find({ 'shelterInfo.shelterId': req.params.shelterId })
      .sort({ dateAdded: -1 });
    
    res.json(pets);
  } catch (err) {
    console.error('Error fetching shelter pets:', err);
    res.status(500).json({ error: "Error fetching shelter pets", message: err.message });
  }
});

// Get featured pets (recently added or special)
router.get("/featured/list", async (req, res) => {
  try {
    const featuredPets = await Pet.find({ 
      adoptionStatus: 'available' 
    })
    .sort({ dateAdded: -1 })
    .limit(8);
    
    res.json(featuredPets);
  } catch (err) {
    console.error('Error fetching featured pets:', err);
    res.status(500).json({ error: "Error fetching featured pets", message: err.message });
  }
});

// Search pets with advanced filters
router.post("/search", async (req, res) => {
  try {
    const {
      species,
      breed,
      ageRange,
      sizePreference,
      goodWithKids,
      goodWithPets,
      houseTrained,
      location,
      maxDistance,
      personality
    } = req.body;
    
    let filter = { adoptionStatus: 'available' };
    
    if (species && species.length > 0) {
      filter.species = { $in: species };
    }
    
    if (breed) {
      filter.breed = new RegExp(breed, 'i');
    }
    
    if (ageRange) {
      if (ageRange.min !== undefined) filter.age = { ...filter.age, $gte: ageRange.min };
      if (ageRange.max !== undefined) filter.age = { ...filter.age, $lte: ageRange.max };
    }
    
    if (sizePreference && sizePreference.length > 0) {
      filter.size = { $in: sizePreference };
    }
    
    if (goodWithKids !== undefined) {
      filter['personality.goodWithKids'] = goodWithKids;
    }
    
    if (goodWithPets !== undefined) {
      filter['personality.goodWithPets'] = goodWithPets;
    }
    
    if (houseTrained !== undefined) {
      filter['personality.houseTrained'] = houseTrained;
    }
    
    if (location) {
      if (location.city) filter['location.city'] = new RegExp(location.city, 'i');
      if (location.state) filter['location.state'] = new RegExp(location.state, 'i');
    }
    
    const pets = await Pet.find(filter)
      .sort({ dateAdded: -1 })
      .limit(50);
    
    res.json(pets);
  } catch (err) {
    console.error('Error searching pets:', err);
    res.status(500).json({ error: "Error searching pets", message: err.message });
  }
});

// Initialize dummy pets data
router.post("/init-dummy-data", async (req, res) => {
  try {
    // Clear existing pets
    await Pet.deleteMany({});
    
    const dummyPets = [
      {
        petId: "pet_001",
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        age: 3,
        gender: "male",
        size: "large",
        color: "Golden",
        description: "Friendly and energetic dog, loves playing fetch and swimming.",
        vaccinated: true,
        spayedNeutered: true,
        adoptionStatus: "available",
        shelterInfo: {
          shelterId: "shelter_001",
          shelterName: "Happy Paws Shelter",
          contactInfo: {
            phone: "(555) 123-4567",
            email: "info@happypaws.com",
            address: "123 Main St, Anytown, ST 12345"
          }
        },
        location: {
          city: "Anytown",
          state: "California",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        adoptionFee: 150,
        personality: {
          energyLevel: "high",
          goodWithKids: true,
          goodWithPets: true,
          houseTrained: true,
          temperament: ["friendly", "playful", "loyal"]
        },
        images: ["https://example.com/buddy1.jpg", "https://example.com/buddy2.jpg"]
      },
      {
        petId: "pet_002",
        name: "Whiskers",
        species: "cat",
        breed: "Domestic Shorthair",
        age: 2,
        gender: "female",
        size: "medium",
        color: "Calico",
        description: "Sweet and affectionate cat who loves to cuddle.",
        vaccinated: true,
        spayedNeutered: true,
        adoptionStatus: "available",
        shelterInfo: {
          shelterId: "shelter_002",
          shelterName: "Feline Friends Rescue",
          contactInfo: {
            phone: "(555) 987-6543",
            email: "contact@felinefriends.org",
            address: "456 Oak Ave, Petville, ST 54321"
          }
        },
        location: {
          city: "Petville",
          state: "Texas",
          coordinates: { lat: 32.7767, lng: -96.7970 }
        },
        adoptionFee: 75,
        personality: {
          energyLevel: "medium",
          goodWithKids: true,
          goodWithPets: false,
          houseTrained: true,
          temperament: ["calm", "affectionate", "independent"]
        },
        images: ["https://example.com/whiskers1.jpg"]
      },
      {
        petId: "pet_003",
        name: "Max",
        species: "dog",
        breed: "German Shepherd",
        age: 5,
        gender: "male",
        size: "large",
        color: "Black and Tan",
        description: "Loyal and intelligent dog, great with children.",
        vaccinated: true,
        spayedNeutered: true,
        adoptionStatus: "pending",
        shelterInfo: {
          shelterId: "shelter_001",
          shelterName: "Happy Paws Shelter",
          contactInfo: {
            phone: "(555) 123-4567",
            email: "info@happypaws.com",
            address: "123 Main St, Anytown, ST 12345"
          }
        },
        location: {
          city: "Anytown",
          state: "California",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        adoptionFee: 200,
        personality: {
          energyLevel: "medium",
          goodWithKids: true,
          goodWithPets: true,
          houseTrained: true,
          temperament: ["loyal", "protective", "intelligent"]
        },
        images: ["https://example.com/max1.jpg", "https://example.com/max2.jpg"]
      }
    ];
    
    await Pet.insertMany(dummyPets);
    
    res.status(201).json({
      message: "Dummy pet data initialized successfully",
      count: dummyPets.length
    });
  } catch (err) {
    console.error('Error initializing dummy pet data:', err);
    res.status(500).json({ error: "Error initializing dummy pet data", message: err.message });
  }
});

module.exports = router;