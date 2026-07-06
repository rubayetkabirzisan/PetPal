const axios = require('axios');

async function run() {
  try {
    const payload = {
      userId: "user_1783097560517", // proshan@example.com
      petId: "68d2c612f670bc4e862d1626", // Buddy
      shelterId: "shelter-001",
      petName: "Buddy",
      petBreed: "Golden Retriever",
      petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      shelterName: "PetPal Shelter",
      status: "Pending",
      answers: {
        firstName: "Proshan",
        lastName: "",
        email: "proshan@example.com",
        phone: "01601851313",
        dateOfBirth: "02/03/2003",
        addressLine1: "mirpur",
        city: "Dhaka",
        state: "D",
        zipCode: "1216",
        housingType: "apartment",
        ownOrRent: "rent",
        fencedYard: false,
        previousPets: "None",
        currentPets: "None",
        veterinarian: "None",
        workSchedule: "9 am to 5 pm",
        hoursAlone: "9",
        exerciseCommitment: "low",
        familyMembers: "Mother, Father"
      }
    };
    const res = await axios.post("http://localhost:5000/api/applications/create", payload);
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}

run();
