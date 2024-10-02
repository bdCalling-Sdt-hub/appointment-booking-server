const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const fs = require('fs');
// const path = require('path');
// const { upload } = require('../middlewares.js/fileUpload');
const {uploadNormal} = require('../middlewares.js/fileUploadNormal');
const { isValidUser} = require('../middlewares.js/auth');
const { createDoctorDetails, getDoctor, singleDoctor, sendPrescription, getDoctorDetails, editDoctorDetails, doctorEarnings, withdrawalRequest, lastWithDrawList, getLogInUserReview, emergencyConsultation, loginDoctorStatus, completedAppointments } = require('../controllers/doctor/doctorDetailsController');




router.post('/create-details', createDoctorDetails);
router.get('/get-doctors', isValidUser, getDoctor);
router.get('/get-single-doctor', isValidUser, singleDoctor);
router.post('/send-prescription',isValidUser, uploadNormal.single('file') ,sendPrescription);
router.get('/doctor-details', isValidUser, getDoctorDetails);
router.patch('/edit-details', isValidUser, editDoctorDetails);
router.get('/doctor-earnings', isValidUser, doctorEarnings);
router.post('/withdrawal-request', isValidUser, withdrawalRequest);
router.get('/last-withdraw-list', isValidUser, lastWithDrawList);
router.get('/get-doctor-review', isValidUser, getLogInUserReview);
router.post('/emergency',isValidUser, emergencyConsultation);
router.get('/login-doctor-status', isValidUser, loginDoctorStatus);
router.post('/complete-appointment',isValidUser,completedAppointments);


// router.post('/get-data',uploadNormal.single('file') ,(req, res) => {
//     const filePath = req.file.path;
//     console.log(filePath);
  
//     try {
//       // Load the Excel file
//       const workbook = xlsx.readFile(filePath);
//     //   console.log(workbook);
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
  
//       // Convert the sheet to JSON
//       const jsonArray = xlsx.utils.sheet_to_json(worksheet);

//       console.log(jsonArray);
  
//       // Filter for pharmacies (Provider Taxonomy Code for pharmacies is 333600000X)
//       const pharmacies = jsonArray.filter(
//         (item) => item['NPPES Deactivated Records as of Jul 08 2024'] === '333600000X'
//       );

//       console.log("======>",pharmacies);
  
//       // Select relevant columns
//       const selectedColumns = jsonArray.map((item) => ({
//         name: item['Provider Organization Name (Legal Business Name)'],
//         address: item['Provider First Line Business Practice Location Address'],
//         city: item['Provider Business Practice Location Address City Name'],
//         state: item['Provider Business Practice Location Address State Name'],
//         postalCode: item['Provider Business Practice Location Address Postal Code'],
//         phone: item['Provider Business Practice Location Address Telephone Number'],
//       }));
  
//       // Clean up the uploaded file
//       fs.unlinkSync(filePath);
  
//       // Respond with JSON data
//       res.json(selectedColumns);
//     } catch (error) {
//       console.error('Error processing data:', error);
//       res.status(500).send('Error processing data');
//     }
// });


module.exports = router;