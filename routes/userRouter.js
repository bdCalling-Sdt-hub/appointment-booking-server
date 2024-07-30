const express = require('express');
const router = express.Router();

//import controllers
const { signUp, verifyCode, signIn, resendOtp, forgotPassword, changePassword, setPassword, updateProfile, fillUpProfile, postReview, patientDetails, allUser, getLoginUser } = require('../controllers/userController');
// const {upload,convertImageWithId} = require('../middlewares.js/fileUpload');
const {upload,convertImageWithId} = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const { uploadUserId,convertImage } = require('../middlewares.js/fileUploadUserId');
// const convertImageToPngMiddleware = require('../middlewares.js/converter');
const UPLOADS_FOLDER_USERS = "../public/images/users";
// const { addVehicle } = require('../controllers/vehicalController');
// const { signUpBoutique } = require('../controllers/boutiqueController');
// const { createLocation, getLocations, getLocationById, updateLocation } = require('../controllers/locationController');

// console.log('userController');
// const convertImageToPng = convertImageToPngMiddleware(UPLOADS_FOLDER_USERS);

// // routes
router.get('/all-user',isValidUser, allUser);
router.post('/sign-up', signUp);
router.post('/verify-code', verifyCode);
router.post('/sign-in', signIn);
router.post('/resendOtp', resendOtp);
router.post('/forgot-Password',forgotPassword)
router.post('/set-Password',setPassword)
router.post('/change-password', isValidUser, changePassword);
router.post('/fill-Up-update', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'insurance', maxCount: 1 }]),convertImageWithId, fillUpProfile);
router.post('/post-review', isValidUser, postReview);
router.post('/patient-details-for-doctor', isValidUser, patientDetails);
router.get('/login-user', isValidUser, getLoginUser);
// router.patch('/update-profile', isValidUser, upload.single('image'), updateProfile);
router.put('/update-profile', isValidUser, uploadUserId.single('image'),convertImage, updateProfile);


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