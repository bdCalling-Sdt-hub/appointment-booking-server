const mongoose = require('mongoose');

// Define the location schema
const chatSchema = new mongoose.Schema({
        participants: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        }],
        lastMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          required: false,
        },
      },
      {
        timestamps: true,
      }

);



module.exports = mongoose.model('Chat', chatSchema);