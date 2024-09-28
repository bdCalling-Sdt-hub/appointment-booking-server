const User = require("../models/User");


const admin = {
    firstName: "MD",
    lastName: "ADMIN",
    email: "admin@gmail.com",
    password: "1qazxsw2",
    role: "admin",
    isDeleted: false,
    isVerified: true
  };

const seedSuperAdmin = async () =>{
    const isSuperAdminExists = await User.findOneAndUpdate({ email: admin.email }, admin, { new: true });

    if (!isSuperAdminExists) {
        console.log("Creating super admin...");
        
        await User.create(admin);
    }
}

module.exports = {
    seedSuperAdmin
}