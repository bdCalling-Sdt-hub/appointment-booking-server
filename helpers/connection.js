const mongoose = require('mongoose');
const { seedSuperAdmin } = require('../DB');

module.exports = {
    // Connect to the MongoDB database
    connectToDatabase: async () => {
        try {
            await mongoose.connect(process.env.MONGODB_CONNECTION);
            
            await seedSuperAdmin();
            console.log('Connected to MongoDB');
            
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
};
