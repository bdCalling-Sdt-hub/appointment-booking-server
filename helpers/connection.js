const mongoose = require('mongoose');
const { seedSuperAdmin } = require('../DB');

module.exports = {
    // Connect to the MongoDB database
    connectToDatabase: async () => {
        try {
            // Connect to MongoDB with options for better reliability
            await mongoose.connect(process.env.MONGODB_CONNECTION, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            
            console.log('Connected to MongoDB');
            
            // Seed Super Admin only if necessary
            await seedSuperAdmin();

        } catch (error) {
            console.error('Error connecting to MongoDB:', error.message);
        }
    }
};

