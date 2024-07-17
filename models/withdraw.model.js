const { default: mongoose } = require("mongoose");

// Define the location schema
const withdrawalSchema = new mongoose.Schema({
   
    doctorId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "doctor is required"], default: false },
    bankName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      accountType: {
        type: String,
        required: true,
      },
      withdrawAmount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Completed", "Cancelled"],
        default: "Pending",
      },
    // patientId: { type: mongoose.Schema.ObjectId, ref: 'User', required: [ true, "Patient Id is Required"] },
},{ timestamps: true },);



module.exports = mongoose.model('Withdraw', withdrawalSchema);