const mongoose = require("mongoose");

// Define the location schema
const doctorPrescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id is Required"],
    },
    file: { type: Object, required: true, default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" } },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "doctorId is required"],
      default: false,
    },
    patientDetailsId: {
      type: mongoose.Schema.ObjectId,
      ref: "PatientDetails",
      required: [true, "patientDetailsId is required"],
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorPrescription", doctorPrescriptionSchema);