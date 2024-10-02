const express = require('express');
const router = express.Router();
// const {upload} = require('../middlewares.js/fileUpload');
const  {uploadNormal}  = require('../middlewares.js/fileUploadNormal');
const { isValidUser} = require('../middlewares.js/auth');
const { createCategory, getAllCategories, deleteCategory, getSingleCategory, updateCategory } = require('../controllers/categotyController');


router.post('/create-category', isValidUser,uploadNormal.single("image"), createCategory);
router.get('/get-category', getAllCategories);
router.post('/delete-category',isValidUser,deleteCategory);
router.get('/get-single-category/:categoryId',isValidUser,getSingleCategory);
router.patch('/update-category/:categoryId',isValidUser,uploadNormal.single("image"), updateCategory);


module.exports = router;