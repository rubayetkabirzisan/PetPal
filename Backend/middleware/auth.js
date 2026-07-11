const jwt = require("jsonwebtoken");
const User = require('../models/User');

const auth = async (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user from DB to ensure we have the latest uid and type
    // This fixes issues where old tokens lacked these fields
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    
    // Add user from payload but merge in fresh DB fields
    req.user = {
      id: decoded.id,
      uid: user.uid,
      type: user.userType || "adopter" // fallback if undefined in old documents
    };
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
