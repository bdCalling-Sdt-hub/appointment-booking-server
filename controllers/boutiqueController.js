
const User = require("../models/User");
const { userRegister } = require("../services/userService");

// sign up boutique
const signUpBoutique = async (req, res) => {
    try {
        const { name, email, password, address, rate, phone, city, state, description } = req.body;
      
      const {boutiqueImage}=req.files;
    //   console.log(boutiqueImage,"image")

        // Validate request body
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const userDetails = {
            name,
            email,
            password,
            image:boutiqueImage[0],
            phone,
            rate,
            city,
            state,
            address,
            role: "boutique",
            description
        };

        // Call service function to register user
        await userRegister(userDetails);

        res.status(200).json({ message: "A verification email is sent to your email" });

    } catch (error) {
        console.error("Error in signUp controller:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    signUpBoutique,
};
