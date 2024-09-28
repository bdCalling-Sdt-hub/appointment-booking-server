const User = require("../models/User");


const admin = {
    firstName: "MD",
    lastName: "ADMIN",
    email: "admin@gmail.com",
    password: "1qazxsw2",
    role: "admin",
    isDeleted: false,
  };

const seedSuperAdmin = async () =>{
    const isSuperAdminExists = await User.findOne({ email: admin.email });

    if (!isSuperAdminExists) {
        console.log("Creating super admin...");
        
        await User.create(admin);
    }
}

module.exports = {
    seedSuperAdmin
}