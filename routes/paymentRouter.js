const express = require('express');
const router = express.Router();
// const upload = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const { paymentCreate } = require('../controllers/paymentController');
// const { createCategory, getAllCategories, deleteCategory } = require('../controllers/categotyController');



router.post('/create-payment',isValidUser, paymentCreate);
// router.post('/delete-category',isValidUser,deleteCategory);


module.exports = router;