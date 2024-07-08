const mongoose = require('mongoose');

// Define the location schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: [ true, "Category Name is required"], minlength: 3, maxlength: 30, },
    image: { type: Object, required: false, default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" } },
    isDeleted: { type: Boolean, default: false },
},{ timestamps: true },);



module.exports = mongoose.model('Category', categorySchema);