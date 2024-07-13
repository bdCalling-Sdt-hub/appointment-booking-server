const express = require('express');
const router = express.Router();
const { isValidUser} = require('../middlewares.js/auth');
const { getAppointment, getSingleAppointment } = require('../controllers/appoinmentController');


router.get('/user-get-appointments', isValidUser, getAppointment);
router.get('/user-get-single-appointment/:appointmentId',isValidUser, getSingleAppointment);



module.exports = router;