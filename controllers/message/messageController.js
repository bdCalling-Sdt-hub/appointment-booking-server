const Response = require("../../helpers/response");
const ChatModel = require("../../models/Chat.model");
const MessageModel = require("../../models/Message.model");
const User = require("../../models/User");

const createMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const user = await User.findById(senderId);
    if (!user) {
      return res.status(404).json(
        Response({
          message: "User not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    const { messageType, message, receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json(
        Response({
          message: "Receiver Id is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!messageType) {
      return res.status(400).json(
        Response({
          message: "Message type is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }
    if (!message) {
      return res.status(400).json(
        Response({
          message: "Message is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }
    let image = {};
    if (messageType === "image" || messageType === "video" || messageType === "audio" || messageType === "application" && req.file) {
        image = {
          publicFileURL: `/image/users/${req.file.filename}`,
          path:  `public/image/users/${req.file.filename}`,
        }
    }

   

    const messageBody = {
      content: {
        messageType,
        message,
      },
      senderId,
      receiverId,
      file: image,
    };

    const participants = [senderId, receiverId];

    const existingChat = await ChatModel.findOne({
      participants: { $all: participants },
    });

    let chatId;

    if (existingChat) {
      chatId = existingChat._id;
    } else {
      const chatBody = {
        participants,
      };
      const newChat = await ChatModel.create(chatBody);
      chatId = newChat._id;
    }
    messageBody.chatId = chatId;

    const messageCreate = await MessageModel.create(messageBody);

    const messageEvent = `lastMessage::${chatId}`;
    io.emit(messageEvent, messageCreate);

    const chat = await ChatModel.findByIdAndDelete(chatId, {
      lastMessage: messageCreate?._id,
    });
    const newChatEvent = `chat::${receiverId}`;
    io.emit(newChatEvent, chat);

    res.status(200).json(Response({
      data: messageCreate,
      status: "OK",
      statusCode: 200,
      message: "Message created successfully",
    }));
  } catch (error) {
    console.log(error?.message);
    res.status(500).json(Response({
      message: `Internal server error ${error.message}`,
      status: "Failed",
      statusCode: 500,
    }));
  }
};

const getMessageByChatId = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await MessageModel.find({ chatId }).populate(
      "senderId receiverId"
    );
    console.log(messages);
    res.status(200).json({
      data: messages,
      status: "OK",
      statusCode: 200,
      message: "Messages fetched successfully",
    });
  } catch (error) {
    console.log(error?.message);
    res.status(500).json({
      message: `Internal server error ${error.message}`,
      status: "Failed",
      statusCode: 500,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const senderId = req.userId;
    if (!senderId) {
      return res.status(400).json({
        message: "Sender Id is required",
        status: "Failed",
        statusCode: 400,
      });
    }
    if (!messageId) {
      return res.status(400).json({
        message: "Message Id is required",
        status: "Failed",
        statusCode: 400,
      });
    }

    const message = await MessageModel.findByIdAndDelete(messageId);
    res.status(200).json({
      data: message,
      status: "OK",
      statusCode: 200,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.log(error?.message);
    res.status(500).json({
      message: `Internal server error ${error.message}`,
      status: "Failed",
      statusCode: 500,
    });
  }
};

module.exports = { createMessage, getMessageByChatId, deleteMessage };
