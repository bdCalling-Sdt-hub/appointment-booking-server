const express = require('express');
const router = express.Router();
const upload = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const { createDoctorDetails, getDoctor } = require('../controllers/doctor/doctorDetailsController');



router.post('/create-details', isValidUser, createDoctorDetails);
router.get('/get-doctors', isValidUser, getDoctor);


module.exports = router;