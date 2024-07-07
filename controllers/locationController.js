// Import necessary dependencies

const Location = require("../models/Location");


const jwt = require('jsonwebtoken');

// Controller functions
const createLocation = async (req, res) => {
    console.log(req.body,"new location")
    // Get the token from the request headers
    const tokenWithBearer = req.headers.authorization;
    let token;

    if (tokenWithBearer && tokenWithBearer.startsWith('Bearer ')) {
        // Extract the token without the 'Bearer ' prefix
        token = tokenWithBearer.slice(7);
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is missing.' });
    }

    try {
        // Verify the token
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });
          // Check if the user has already created a location
          const existingLocation = await Location.findOne({ userId: decoded._id });
          if (existingLocation) {
              return res.status(400).json({ success: false, message: 'User has already created a location.' });
          }
  
    const { latitude, longitude } = req.body;
    console.log(latitude,longitude,"location")
    const location = new Location({ userId:decoded._id, latitude, longitude });
    await location.save();
    res.status(201).json(location);
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: 'Error creating location' });
  }
};

const getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Error fetching locations' });
  }
};

// const getLocationById = async (req, res) => {
//   try {
//     const location = await Location.findById({id:req.params.id});
//     if (!location) {
//       return res.status(404).json({ error: 'Location not found' });
//     }
//     res.json(location);
//   } catch (err) {
//     console.error('Error fetching location by ID:', err);
//     res.status(500).json({ error: 'Error fetching location by ID' });
//   }
// };
const getLocationById = async (req, res) => {
  // Get the token from the request headers
  const tokenWithBearer = req.headers.authorization;
  let token;

  if (tokenWithBearer && tokenWithBearer.startsWith('Bearer ')) {
      // Extract the token without the 'Bearer ' prefix
      token = tokenWithBearer.slice(7);
  }

  if (!token) {
      return res.status(401).json({ success: false, message: 'Token is missing.' });
  }

  try {
      // Verify the token
      const decoded = await new Promise((resolve, reject) => {
          jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
          });
      });
        // Check if the user has already created a location
        const existingLocation = await Location.findOne({ userId: decoded._id });
        if (existingLocation) {
            return res.status(400).json({ success: false, message: 'User has already created a location.' });
        }

    const location = await Location.findById(decoded._id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    console.error('Error fetching location by ID:', err);
    res.status(500).json({ error: 'Error fetching location by ID' });
  }
};

const updateLocation = async (req, res) => {
    console.log(req.params.id)
//   try {
//     const { latitude, longitude } = req.body;
//     console.log(latitude,longitude)
//     // const location = await Location.findByIdAndUpdate(req.params.id, { latitude, longitude }, { new: true });
//     // if (!location) {
//     //   return res.status(404).json({ error: 'Location not found' });
//     // }
//     res.json("new");
//   } catch (err) {
//     console.error('Error updating location:', err);
//     res.status(500).json({ error: 'Error updating location' });
//   }
};

const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: 'Error deleting location' });
  }
};
module.exports = { getLocationById,getLocations,deleteLocation,updateLocation,createLocation };