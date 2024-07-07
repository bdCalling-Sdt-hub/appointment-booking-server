const mongoose = require('mongoose');

// Define the location schema
const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: false },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  }
},{ timestamps: true },);



module.exports = mongoose.model('Location', locationSchema);