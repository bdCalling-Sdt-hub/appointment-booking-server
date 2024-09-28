const User = require("../models/User");

const admin = {
    firstName: "MD",
    lastName: "ADMIN",
    email: "admin1@gmail.com",
    password: "1qazxsw2", // Make sure to hash the password before storing it in production
    role: "admin",
    isDeleted: false,
    isVerified: true
};

const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await User.findOne({ email: admin.email });
        console.log("SuperAdmin search result:", isSuperAdminExists);

        if (isSuperAdminExists) {
            // If the admin exists, ensure it's verified
            isSuperAdminExists.isVerified = true;
            await isSuperAdminExists.save();
            console.log("SuperAdmin already exists and is now verified:", isSuperAdminExists);
        } else {
            // If the admin does not exist, create it
            console.log("Creating new Super Admin...");
            await User.create(admin);
            console.log("Super Admin created.");
        }
    } catch (error) {
        console.error("Error seeding Super Admin:", error.message);
    }
};

module.exports = {
    seedSuperAdmin
};
