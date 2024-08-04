const express = require('express');
const router = express.Router();

const { isValidUser} = require('../middlewares.js/auth');
const { addPrivacyPolicy, getPrivacyPolicy, addTermsCondition, getTermsCondition, getAboutUs, addAboutUs } = require('../controllers/settings/settingsController');


// Import controller function



// routes
router.put('/privacy-policy',isValidUser,addPrivacyPolicy);
router.get('/privacy-policy',getPrivacyPolicy);
router.put('/terms-condition',isValidUser,addTermsCondition);
router.get('/terms-condition',getTermsCondition);
router.get('/about-us',getAboutUs);
router.put('/about-us',isValidUser,addAboutUs);	

module.exports = router;