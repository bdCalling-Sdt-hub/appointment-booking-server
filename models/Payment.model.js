const mongoose = require('mongoose');

// Define the location schema
const paymentSchema = new mongoose.Schema({
    transactionId: { type: String, required: [ true, "Category Name is required"],unique: true, minlength: 3, maxlength: 30, },
    patientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "Patient Id is Required"] },
    price: { type: Number, required: [ true, "Rating is required"] },
    date: { type: Date, required: [ true, "Date is required"] },
    timeSlot: { type: String, required: [ true, "Time slot is required"] },
    patientDetailsId: { type:mongoose.Schema.ObjectId, ref:'PatientDetails', required: [ true, "Patient Details is required"] },
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "doctor is required"], default: false },
    paymentData: { type: Object, required: [ false, "Payment Data is required"] },
    status: { type: String, enum: [ "completed", "active"], required: [ false, "Status is required"], default: null },
    isCompleted: { type: Boolean, default: false , required: [ true, "isCompleted is required"] },
},{ timestamps: true },)



module.exports = mongoose.model('Payment', paymentSchema);