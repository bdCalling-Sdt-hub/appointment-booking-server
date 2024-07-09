const mongoose = require('mongoose');

// Define the location schema
const paymentSchema = new mongoose.Schema({
    transactionId: { type: String, required: [ true, "Category Name is required"]},
    price: { type: Number, required: [ true, "Rating is required"] },
    date: { type: Date, default: Date.now, required: [ true, "Date is required"] },
    timeSlot: { type: String, required: [ true, "Time slot is required"] },
    patientDetailsId: { type:mongoose.Schema.ObjectId, ref:'PatientDetails', required: [ true, "Patient Details is required"] },
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "doctor is required"], default: false },
    paymentData: { type: Object, required: [ true, "Payment Data is required"] },
},{ timestamps: true },)



module.exports = mongoose.model('Payment', paymentSchema);