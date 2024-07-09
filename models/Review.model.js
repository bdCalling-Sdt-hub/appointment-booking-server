const mongoose = require('mongoose');

// Define the location schema
const reviewSchema = new mongoose.Schema({
    comment: { type: String, required: [ true, "Category Name is required"], minlength: 3, maxlength: 30, },
    rating: { type: Number, required: [ true, "Rating is required"], minlength: 3, maxlength: 30, },
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "doctor is required"], default: false },
},{ timestamps: true },);



module.exports = mongoose.model('Review', reviewSchema);