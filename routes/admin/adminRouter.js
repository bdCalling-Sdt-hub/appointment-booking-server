const express = require('express');
const router = express.Router();
// const {upload} = require('../middlewares.js/fileUpload');
// const { isValidUser} = require('../middlewares.js/auth');
const { createPercentage, getAllWithdrawals, updateWithdrawalRequest, getAndUpdateWithdrawalRequest, getAllAppointments, getAllDoctors, getAllUser, createPercentageAmount } = require('../../controllers/admin/adminController');
const { isValidUser } = require('../../middlewares.js/auth');
// const { createCategory, getAllCategories, deleteCategory } = require('../controllers/categotyController');


router.post('/create-percentage',isValidUser,createPercentage);
router.get('/get-withdraw-request',isValidUser,getAllWithdrawals);
router.post('/update-withdraw-request',isValidUser,updateWithdrawalRequest)
router.get('/get-all-appointments',isValidUser,getAllAppointments)
router.get('/get-all-doctors',isValidUser,getAllDoctors)
router.get('/get-all-users',isValidUser,getAllUser)
router.post('/create-percentage-amount',isValidUser,createPercentageAmount)

// router.get('/get-category',isValidUser, getAllCategories);
// router.post('/delete-category',isValidUser,deleteCategory);


module.exports = router;