const express = require('express');
const router = express.Router();
const { isValidUser} = require('../middlewares.js/auth');
const { getAppointment } = require('../controllers/appoinmentController');


router.get('/get-appointments', isValidUser, getAppointment);



module.exports = router;