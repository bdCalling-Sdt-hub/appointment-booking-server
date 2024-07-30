const mongoose = require("mongoose");

// Define the location schema
const percentageSchema = new mongoose.Schema(
  {
    percentageAmount: {
      type: Number,
      required: [true, "Percentage Amount is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Percentage", percentageSchema);
