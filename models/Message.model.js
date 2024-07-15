const mongoose = require('mongoose');

// Define the location schema
const messageSchema = new mongoose.Schema(
    {
        chatId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chat",
          required: true,
        },
        content: {
          messageType: {
            type: String,
            enum: ["image", "application", "audio", "video", "unknown", "text"],
            required: false,
          },
          message: { type: String, required: false },
          path: { type: String, required: false },
        },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        receiverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        file: {
            type: Object,
            default: { publicFileURL: "/images/users/1720412579491-user.png", path: "null" },
        },
        // replyTo: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "Message",
        //   required: false,
        // },
        // deletedBy: {
        //   type: Array,
        //   default: [],
        // },
        // readed: {
        //   type: Boolean,
        //   required: true,
        //   default: false,
        // },
      },
      {
        timestamps: true,
      }

);



module.exports = mongoose.model('Message', messageSchema);