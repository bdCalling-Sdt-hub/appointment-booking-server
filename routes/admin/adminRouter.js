const express = require('express');
const router = express.Router();
// const {upload} = require('../middlewares.js/fileUpload');
// const { isValidUser} = require('../middlewares.js/auth');
const { createPercentage, getAllWithdrawals } = require('../../controllers/admin/adminController');
const { isValidUser } = require('../../middlewares.js/auth');
// const { createCategory, getAllCategories, deleteCategory } = require('../controllers/categotyController');


router.post('/create-percentage',isValidUser,createPercentage);
router.get('/get-withdraw-request',isValidUser,getAllWithdrawals);

// router.get('/get-category',isValidUser, getAllCategories);
// router.post('/delete-category',isValidUser,deleteCategory);


module.exports = router;