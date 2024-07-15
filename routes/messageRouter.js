const express = require('express');
const router = express.Router();
const {upload} = require('../middlewares.js/fileUpload');
const { isValidUser} = require('../middlewares.js/auth');
const { createChat, getAllChatForUser } = require('../controllers/chat/chatController');
const { createMessage, getMessageByChatId } = require('../controllers/message/messageController');
const uploadForMessage = require('../middlewares.js/fileUploadForMessage');



router.post('/create-message-with-file', isValidUser, uploadForMessage.single('image'), createMessage);
router.get('/get-message/:chatId', isValidUser,  getMessageByChatId);
router.get('/delete-message/:messageId', isValidUser, getAllChatForUser);
// router.get('/get-category',isValidUser, getAllCategories);
// router.post('/delete-category',isValidUser,deleteCategory);


module.exports = router;