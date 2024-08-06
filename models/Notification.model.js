// models/Notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  message: { type: String, required: true },
  role: { type: String, enum: ["admin", "user", "doctor"], required: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false },
}
,
{ timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
