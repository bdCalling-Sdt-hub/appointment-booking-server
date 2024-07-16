const mongoose = require("mongoose");

// Define the location schema
const doctorEarningSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id is Required"],
    },
    price: { type: Number, required: [true, "Price is required"] },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "doctorId is required"],
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorEarning", doctorEarningSchema);