const express = require('express');
const router = express.Router();
const {upload} = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const { createChat, getAllChatForUser } = require('../controllers/chat/chatController');



router.post('/create-chat', isValidUser, createChat);
router.get('/get-chat', isValidUser, getAllChatForUser);
// router.get('/get-category',isValidUser, getAllCategories);
// router.post('/delete-category',isValidUser,deleteCategory);


module.exports = router;