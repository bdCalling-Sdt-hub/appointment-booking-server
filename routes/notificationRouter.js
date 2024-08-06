const express = require('express');
const router = express.Router();
const {upload} = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const getAllNotification = require('../controllers/getAllNotification');





router.get('/', isValidUser, getAllNotification);

// router.post('/delete-category',isValidUser,deleteCategory);


module.exports = router;