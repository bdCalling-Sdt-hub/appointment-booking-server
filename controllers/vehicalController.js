
const Driver = require("../models/Driver");
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const addVehicle = async (req, res, next) => {
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

        console.log(decoded.role,"this role")
        // Proceed with authentication or authorization logic

        // Find the user by ID from the decoded token
        const user = await User.findOne({ _id: decoded._id, role:"driver" });

        if (!user) {
            return res.status(401).json({ success: false, message: 'your are not a driver .' });
        }

        // Check if the driver has already added a vehicle
        const existingVehicle = await Driver.findOne({ userId: decoded._id }).exec();

        if (existingVehicle) {
            return res.status(400).json({ success: false, message: 'Driver has already added a vehicle.' });
        }

        // If the driver is valid and has not added a vehicle yet
        const { make, model, year } = req.body;
        const { driverLicense, registration, policeCheck, registrationNumber } = req.files;

        // Create a new vehicle object with user ID
        const newVehicle = new Driver({
            userId: decoded._id,
            make,
            model,
            year,
            driverLicense,
            registration,
            policeCheck,
            registrationNumber
        });

        // Save the new vehicle to the database
        await newVehicle.save();

        return res.status(200).json({ success: true, message: 'Vehicle added successfully.' });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = { addVehicle };
