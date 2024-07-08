const mongoose = require('mongoose');

// Define the location schema
const doctorDetailsSchema = new mongoose.Schema({
    specialist: { type: String, required: [ true, "Specialist is required"] },
    experience: { type: String, required: [ true, "Experience is required"] },
    clinicAddress: { type: String, required: [ true, "Clinic Address is required"] },
    about: { type: String, required: [ true, "About is required"] },
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "doctor is required"] },
    // doctorId: { type: String, required: [ true, "doctorId is required"] },
    clinicPrice: { type: String, required: [ true, "Clinic Price is required"] },
    onlineConsultationPrice: { type: String, required: [ true, "Online Consultation is required"] },
    emergencyPrice: { type: String, required: [ true, "Emergency is required"] },
    schedule: { type: Array, required: [ true, "Schedule is required"] },
},{ timestamps: true },);



module.exports = mongoose.model('DoctorDetails', doctorDetailsSchema);