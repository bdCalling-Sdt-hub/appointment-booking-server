const mongoose = require('mongoose');

// Define the location schema
const patientDetailsSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "Patient Id is Required"] },
    fullName: { type: String, required: [ true, "Full Name is required"] },
    gender: { type: String, enum: ["male", "female"], required: [ true, "Gender is required"], default: false },
    age: { type: String, required: false },
    description: { type: String, required: false },
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "Doctor Id is Required"] },
})



module.exports = mongoose.model('PatientDetails', patientDetailsSchema);