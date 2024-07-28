const express = require('express');
const router = express.Router();
// const { upload } = require('../middlewares.js/fileUpload');
const upload = require('../middlewares.js/fileUploadNormal');
const { isValidUser} = require('../middlewares.js/auth');
const { createDoctorDetails, getDoctor, singleDoctor, sendPrescription, getDoctorDetails, editDoctorDetails, doctorEarnings, withdrawalRequest, lastWithDrawList, getLogInUserReview, emergencyConsultation, loginDoctorStatus, completedAppointments } = require('../controllers/doctor/doctorDetailsController');



router.post('/create-details', createDoctorDetails);
router.get('/get-doctors', isValidUser, getDoctor);
router.get('/get-single-doctor', isValidUser, singleDoctor);
router.post('/send-prescription',isValidUser, upload.single('file') ,sendPrescription);
router.get('/doctor-details', isValidUser, getDoctorDetails);
router.patch('/edit-details', isValidUser, editDoctorDetails);
router.get('/doctor-earnings', isValidUser, doctorEarnings);
router.post('/withdrawal-request', isValidUser, withdrawalRequest);
router.get('/last-withdraw-list', isValidUser, lastWithDrawList);
router.get('/get-doctor-review', isValidUser, getLogInUserReview);
router.post('/emergency',isValidUser, emergencyConsultation);
router.get('/login-doctor-status', isValidUser, loginDoctorStatus);
router.post('/complete-appointment',isValidUser,completedAppointments);


module.exports = router;