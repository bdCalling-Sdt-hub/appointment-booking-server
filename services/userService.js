const emailWithNodemailer = require("../helpers/email");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const { createJSONWebToken } = require('../helpers/jsonWebToken');
const { forgotPassword } = require("../controllers/userController");
//register user
const userRegister = async (userDetails) => {
    try {
        // Business logic for user registration
        console.log("Received user details:", userDetails); // Remove the { userDetails }
        let { email, firstName, lastName } = userDetails;
        // Generate OTC (One-Time Code)
        const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        // Prepare email for activate user
        const emailData = {
            email,
            subject: "Account Activation Email",
            html: `
        <body style="background-color: #f3f4f6; padding: 1rem; font-family: Arial, sans-serif;">
          <div style="max-width: 24rem; margin: 0 auto; background-color: #fff; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Welcome to Doctor Appointment Booking App</h1>
            <h1>Hello, ${firstName} ${lastName}</h1>
            <p style="color: #4b5563; margin-bottom: 1rem;">Thank you for joining Shooting App. Your account is almost ready!</p>
            <div style="background-color: #e5e7eb; padding: 1rem; border-radius: 0.25rem; text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">${oneTimeCode}</div>
            <p style="color: #4b5563; margin-bottom: 1rem;">Enter this code to verify your account.</p>
            <p style="color: red; font-size: 0.8rem; margin-top: 1rem;">This code expires in <span id="timer">3:00</span> minutes.</p>
          </div>
      </body>
      `,
          };
console.log(oneTimeCode);
        // Send email
        try {
            emailWithNodemailer(emailData);
        } catch (emailError) {
            console.error('Failed to send verification email', emailError);
            res.status(500).json({ message: 'Error creating user', error: emailError });
        }
        let newUserDetails = { ...userDetails, oneTimeCode: oneTimeCode };
        if(!oneTimeCode)return
         const user = await User.create(newUserDetails); // Remove the { userDetails } wrapper
        // Set a timeout to update the oneTimeCode to null after 1 minute
        setTimeout(async () => {
            try {
                user.oneTimeCode = null;
                await user.save();
                console.log('oneTimeCode reset to null after 3 minutes');
            } catch (error) {
                console.error('Error updating oneTimeCode:', error);
            }
        }, 180000); // 3 minutes in milliseconds
    } catch (error) {
        console.error("Error in userRegister service:", error);
        throw new Error("Error occurred while registering user");
    }
};
// user logging
const userLogin = async ({ email, password, user }) => {

    try {
        const expiresInOneYear = 365 * 24 * 60 * 60; // seconds in 1 year
        const accessToken = createJSONWebToken({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET_KEY, expiresInOneYear);
        console.log(accessToken);
        return accessToken;
    } catch (error) {
        console.error("Error in userLogin service:", error);
        throw new Error("Error occurred while logging in user");
    }
};
// forgot the password
const forgotPasswordService = async (email, user) => {
    try {
        const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        // Prepare email for activate user
        const emailData = {
            email,
            subject: "Account Activation Email",
            html: `
        <body style="background-color: #f3f4f6; padding: 1rem; font-family: Arial, sans-serif;">
          <div style="max-width: 24rem; margin: 0 auto; background-color: #fff; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Welcome to Doctor Appointment Booking App</h1>
            <h1>Hello, ${user?.firstName} ${user?.lastName}</h1>
            <p style="color: #4b5563; margin-bottom: 1rem;">Thank you for joining Shooting App. Your account is almost ready!</p>
            <div style="background-color: #e5e7eb; padding: 1rem; border-radius: 0.25rem; text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">${oneTimeCode}</div>
            <p style="color: #4b5563; margin-bottom: 1rem;">Enter this code to verify your account.</p>
            <p style="color: red; font-size: 0.8rem; margin-top: 1rem;">This code expires in <span id="timer">3:00</span> minutes.</p>
          </div>
      </body>
      `,
          };

        // Send email
        try {
            emailWithNodemailer(emailData);
        } catch (emailError) {
            console.error('Failed to send verification email', emailError);
            throw new Error('Error creating user');
        }
        //Set one time code to user
        user.oneTimeCode = oneTimeCode;
        await user.save();

        const expiresInOneHour = 36000; // seconds in 1 hour
        const accessToken = createJSONWebToken({ _id: user._id, email: user.email}, process.env.JWT_SECRET_KEY, expiresInOneHour);
       
        return accessToken;
    } catch (error) {
        console.error("Error in forgotPassword service:", error);
        throw new Error("Error occurred while logging in user");
    }
};

const verifyCodeService = async ({ user, code }) => {
    console.log("-------user--------", user)
    console.log("--------code-------", code)
   

    try {
        if (user.oneTimeCode === code) {
            user.isVerified = true;
            
            await user.save();
            
            // Set a timeout to reset oneTimeCode to null after 3 minutes
            setTimeout(async () => {
                user.oneTimeCode = null;
                await user.save();
                console.log("oneTimeCode reset to null after 3 minutes");
            }, 3 * 60 * 1000); // 3 minutes in milliseconds

            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error in verifyCode service:", error);
        throw new Error("Error occurred while verifying code");
    }
};

// change the password sercvice
const changePasswordService = async ({user, password}) => {
    console.log(user.password=password,"this is password")
    try {
        if(user){
           
            user.password = password;
            await user.save();
            return true;
        }
        else{
            throw new Error("Error occurred while changing password");
        }
    } catch (error) {
        console.error("Error in changePassword service:", error.message);
        throw new Error("Error occurred while changing password");
    }
}


module.exports = {
    userRegister,
    userLogin,
    forgotPasswordService,
    verifyCodeService,
    changePasswordService,
   

};
