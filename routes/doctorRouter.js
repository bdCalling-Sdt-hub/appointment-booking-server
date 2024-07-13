const express = require('express');
const router = express.Router();
const upload = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const { createDoctorDetails, getDoctor, singleDoctor } = require('../controllers/doctor/doctorDetailsController');



router.post('/create-details', createDoctorDetails);
router.get('/get-doctors', isValidUser, getDoctor);
router.get('/get-single-doctor', isValidUser, singleDoctor);


module.exports = router;