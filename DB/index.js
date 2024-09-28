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
    const isSuperAdminExists = await User.findOne({ email: admin.email });
    isSuperAdminExists.isVerified = true
    await isSuperAdminExists.save()
    console.log("isSuperAdminExists", isSuperAdminExists);
    

    if (!isSuperAdminExists) {
        console.log("Creating super admin...");
        
        await User.create(admin);
    }
}

module.exports = {
    seedSuperAdmin
}