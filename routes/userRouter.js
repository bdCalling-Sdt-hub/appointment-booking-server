const express = require('express');
const router = express.Router();

//import controllers
const { signUp, verifyCode, signIn, resendOtp, forgotPassword, changePassword, setPassword, updateProfile, fillUpProfile, postReview, patientDetails } = require('../controllers/userController');
const upload = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
// const { addVehicle } = require('../controllers/vehicalController');
// const { signUpBoutique } = require('../controllers/boutiqueController');
// const { createLocation, getLocations, getLocationById, updateLocation } = require('../controllers/locationController');

// console.log('userController');

// // routes
router.post('/sign-up', signUp);
router.post('/verify-code', verifyCode);
router.post('/sign-in', signIn);
router.post('/resendOtp', resendOtp);
router.post('/forgot-Password',forgotPassword)
router.post('/set-Password',setPassword)
router.post('/change-password', isValidUser, changePassword);
router.post('/fill-Up-update', isValidUser, [upload.single("image")], fillUpProfile);
router.post('/post-review', isValidUser, postReview);
router.post('/patient-details-for-doctor', isValidUser, patientDetails);
// router.post('/changePasswordUsingOldPassword',changePasswordUsingOldPassword)
// router.post('/forgot-password', forgotPassword);
// router.post('/verify-code', verifyCode);
// router.post('/change-password', cahngePassword);
// // opt resend
// router.post("/resend",resendOtp)

// // router.post('/vehicalDetails/:userId',upload.array["image",3],addVehicle)

// router.post('/vehicalDetails', upload, addVehicle);
// // boutique signup route 
// router.post('/signUp-Boutique', upload, signUpBoutique);
// // location 
// router.post('/locations',createLocation);
// router.get('/locations',getLocations);
// router.get('/locations/:id',getLocationById);
// router.put('/location/:id',updateLocation);
module.exports = router;