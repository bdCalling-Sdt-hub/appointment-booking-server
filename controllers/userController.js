const { userRegister, userLogin, forgotPasswordService, verifyCodeService, changePasswordService } = require("../services/userService");
const Response = require("../helpers/response");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const { createJSONWebToken } = require('../helpers/jsonWebToken');
const emailWithNodemailer = require("../helpers/email");
const { deleteImage } = require("../helpers/deleteImage");
const ReviewModel = require("../models/Review.model");
const PatientDetailsModel = require("../models/PatientDetails.model");



//sign up user
const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password,role } = req.body;
        console.log(email);
        // const {image} = req.files;
        // Validate request body
        if (!firstName) {
            return res.status(400).json(Response({  status:"Failed", statusCode:400,message: "First name is required" }));
        }

        if (!lastName) {
            return res.status(400).json(Response({ status:"Failed", statusCode:400, message: "Last name is required" }));
        }

        if (!password) {
            return res.status(400).json(Response({ status:"Failed", statusCode:400, message: "Password is required" }));
        }

        if(!email){
            return res.status(400).json(Response({ status:"Failed", statusCode:400, message: "Email is required" }));
        }

        if(!role){
            return res.status(400).json(Response({ status:"Failed", statusCode:400, message: "Role is required" }));
        }
        
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json(Response({ status:"Failed", statusCode:400, message: "User already exists" }));
        }

        let userDetails = {
             firstName, lastName, email, password,role 
        }


       

        // Call service function to register user
       const userResponse = await userRegister(userDetails);
       console.log(userResponse);

        res.status(200).json(Response({statusCode:200,status:"sign up successfully", message: "A verification email is sent to your email", data:{userId:userResponse?._id} }));

    } catch (error) {
        console.error("Error in signUp controller:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// resend otp
const resendOtp = async(req,res, )=>{
    try {
        // Extract email from request body
        const { email } = req.body;
        console.log(email)
    
        // Validate email
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
    
        // Find user by email
        const user = await User.findOne({ email });
        console.log(user,'suerr')
    
        // Check if user exists
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Generate a new OTP
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
    if(user.oneTimeCode===null){
        res.status(400).json(Response({statusCode:400,status:'Failed', message: 'you alredy have otp please chaeck your email' }));
    }
        // Update user's oneTimeCode
        user.oneTimeCode = oneTimeCode;
        await user.save();
    
        // Send verification email with new OTP
        await emailWithNodemailer(emailData);
    
        // Send success response
        res.status(200).json(Response({statusCode:200,status:'ok', message: 'OTP has been resent successfully' }));
      } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json(Response({statusCode:500,status:'Failed', message: 'Failed to resend OTP' })) // { error: 'Failed to resend OTP' }

        
      }
}

//Sign in user
const signIn = async (req, res, next) => {
    try {
        // Get email and password from req.body
        const { email, password } = req.body;
        console.log("--------Email-SignIn-Controller", email)
       

        // Find the user by email
        const user = await User.findOne({ email });
        console.log("-------------->>>>>", user)

        if (!user) {
            return res.status(404).json(Response({ statusCode: 404, message: 'User not found', status: "Failed" }));
        }

        if(user.isVerified === false){
res.status(401).json(Response({statusCode:401, message:'you are not veryfied',status:'Failed'}))
        }

        // Check if the user is banned
        if (user.isBlocked) {
            return res.status(401).json(Response({ statusCode: 401, message: 'You are blocked', status: "Failed" }));
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("---------------", isPasswordValid)

        if (!isPasswordValid) {
            res.status(401).json(Response({ statusCode: 401, message: 'Invalid password', status: "Failed" }));
        }

        // Call userLogin service function
        const accessToken = await userLogin({ email, password, user });

        //Success response
        res.status(200).json(Response({ statusCode: 200, message: 'Authentication successful', status: "OK", data: user, token: accessToken, type: "user" }));

    } catch (error) {
     
        next(Response({ statusCode: 500, message: `Internal server error ${error.message}`, status: "Failed" }));
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
       
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json(Response({ statusCode: 404, message: 'User not found', status: "Failed" }));
        }
console.log("email", user);
        await forgotPasswordService(email, user);
        res.status(200).json(Response({ statusCode: 200, message: 'A verification code is sent to your email', status: "OK" }));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response({ statusCode: 500, message: `Internal server error ${error.message}`, status: "Failed" }));
    }
};

//verify code
const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        // console.log("code-ifh", code)
       
        const user = await User.findOne({ email });
        if (!email) {
            return res.status(404).json(Response({ statusCode: 404, message: 'User not found', status: "Failed" }));
        }
        if (!code) {
            return res.status(404).json(Response({ statusCode: 404, message: 'User not found', status: "Failed" }));
        }
        if (!user) {
            return res.status(404).json(Response({ statusCode: 404, message: 'User not found', status: "Failed" }));
        }
if(user.oneTimeCode===code){
    await verifyCodeService({ user, code })

    res.status(200).json(Response({ statusCode: 200, message: 'User verified successfully', status: "OK" }));


}else{
    return res.status(404).json(Response({ statusCode: 404, message: 'code is not valid', status: "Failed" }));
}
       
    } catch (error) {
        console.error(error);
        res.status(500).json(Response({ statusCode: 500, message: `Internal server error ${error.message}`, status: "Failed" }));
    }
};

// change password

const setPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        

        const user = await User.findOne({ email });
        
        if (!email) {
            return res.status(404).json(Response({ statusCode: 404, message: 'Email is required', status: "Failed" }));
        }
        if (!password) {
            return res.status(404).json(Response({ statusCode: 404, message: 'Password is required', status: "Failed" }));
        }

        if (!user) {
            return res.status(404).json(Response({ statusCode: 404, message: 'User not found', status: "Failed" }));
        }

        await changePasswordService({ user, password });

        res.status(200).json(Response({ statusCode: 200, message: 'Password changed successfully', status: "OK" }));

    } catch (error) {
        res.status(500).json(Response({ statusCode: 500, message: `Internal server error ${error.message}`, status: "Failed" }));
    }
};

const changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      console.log(oldPassword, newPassword);
      const loggedInUser = await User.findOne({ _id: req.body.userId });
      console.log("loggedInUser", loggedInUser);
      if (!loggedInUser) {
        return res
          .status(400)
          .json(Response({ message: "Old password is required" }));
      }
      if (!oldPassword) {
        return res
          .status(400)
          .json(Response({ message: "Old password is required" }));
      }
      if (!newPassword) {
        return res
          .status(400)
          .json(Response({ message: "New password is required" }));
      }
  
      let isPasswordValid = await bcrypt.compare(
        oldPassword,
        loggedInUser.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(Response({ message: "Password does not match" }));
      }
      loggedInUser.password = newPassword;
      await loggedInUser.save();
      res
        .status(200)
        .json(Response({ message: "Password changed successfully" }));
    } catch (error) {
      console.error(error);
      return res.status(500).json(Response({ message: `Internal server error ${error.message}` }));
    }
};

const fillUpProfile = async (req, res) => {
    try {
        const {userId} = req.body;
        console.log(userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', status: "Failed", statusCode: 404 });
        }

        let image = {};
        let insurance = {};
        console.log("======>",req.file);
        if(req.file && req.file.image){
            if(user?.image && user?.image?.publicFileURL){
                deleteImage(user?.image?.publicFileURL)
            }
            const imageFile = req.file.image[0];
            image = {
                publicFileURL:`images/users/${imageFile.filename}`,
                path: `public/images/users/${imageFile.filename}`
            }
        }

        if (req.files && req.files.insurance) {
            // Delete old insurance if any
            if (user?.insurance && user.insurance.publicFileURL) {
                deleteImage(user.insurance.publicFileURL);
            }
            // Add new insurance
            const insuranceFile = req.files.insurance[0];
            insurance = {
                publicFileURL: `images/users/${insuranceFile.filename}`,
                path: `public/images/users/${insuranceFile.filename}`
            };
            user.isProfileCompleted = true;
            user.insurance = insurance;
            await user.save();
        }
        


console.log(image);
const {gender,dateOfBirth,phone,address} = req.body;
        user.gender = gender;
        user.dateOfBirth = dateOfBirth;
        user.phone = phone;
        user.address = address;
        user.image = image;
        user.isProfileCompleted = true;
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', status: "OK", statusCode: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `${error?.message}`, status: "Failed", statusCode: 500 });
        
    }
}

const postReview = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(Response({ message: 'User not found', status: "Failed", statusCode: 404 }));
        }
        console.log(user?.role);
        if(user?.role !== "user"){
            return res.status(404).json(Response({ message: "You are not authorized to perform this action", status: "Failed", statusCode: 403 })); 
        }

        const { doctorId, rating, comment } = req.body;

        if(!doctorId){
            return res.status(404).json(Response({ message: "Doctor Id is required", status: "Failed", statusCode: 404 }));
        }

        if(!rating){
            return res.status(404).json(Response({ message: "Rating is required", status: "Failed", statusCode: 404 }));
        }

        if(!comment){
            return res.status(404).json(Response({ message: "Comment is required", status: "Failed", statusCode: 404 }));
        }

        const newReview = await ReviewModel.create({
            doctorId,
            rating,
            comment
        });

        res.status(200).json(Response({ message: "Review created successfully", data: newReview, status: "OK", statusCode: 200 }));

     } catch (error) {
        res.status(500).json(Response({ message: `Internal server error ${error.message}`, status: "Failed", statusCode: 500 }));
    }
}

const patientDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(Response({ message: 'User not found', status: "Failed", statusCode: 404 }));
        }

        if(user?.role !== "user"){
            return res.status(404).json(Response({ message: "You are not authorized to perform this action", status: "Failed", statusCode: 403 }));
        }

        const { fullName,gender, age, description, doctorId } = req.body;
        if(!fullName){
            return res.status(404).json(Response({ message: "Full Name is required", status: "Failed", statusCode: 404 }));
        }

        if(!gender){
            return res.status(404).json(Response({ message: "Gender is required", status: "Failed", statusCode: 404 }));
        }

        if(!age){
            return res.status(404).json(Response({ message: "Age is required", status: "Failed", statusCode: 404 }));
        }
        if(!doctorId){
            return res.status(404).json(Response({ message: "Doctor Id is required", status: "Failed", statusCode: 404 }));
        }
        if(!description){
            return res.status(404).json(Response({ message: "Description is required", status: "Failed", statusCode: 404 }));
        }
        const patientDetails = await PatientDetailsModel.create({
            fullName, gender, age, description, doctorId, patientId: userId
        })

        res.status(200).json(Response({ message: "Patient Details created successfully", data: patientDetails, status: "OK", statusCode: 200 }));
    } catch (error) {
        res.status(500).json(Response({ message: `Internal server error ${error.message}`, status: "Failed", statusCode: 500 }));
    }
}


module.exports = {
    signUp,
    signIn,
    forgotPassword,
    verifyCode,
    setPassword,
    resendOtp,
    changePassword,
    fillUpProfile,
    postReview,
    patientDetails
};
