const   mongoose  = require("mongoose");

// Define the vehicle schema
const vehicleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: false },
   
    make: { type: String, required: true },
    model: { type: String, required: true },
    year:{type :String,required:true},
    driverLicense:{type:Object,required:true,},
    registration:{type:Object,required:true,},
    policeCheck:{type:Object,required:true,},
    registrationNumber:{type:Object,required:true,}
    
  }, { timestamps: true },
);

  
module.exports = mongoose.model('Driver', vehicleSchema);
