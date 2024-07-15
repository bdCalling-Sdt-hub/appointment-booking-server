const Response = require("../../helpers/response");
const ChatModel = require("../../models/Chat.model");
const User = require("../../models/User");

const createChat = async (req, res) => {
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
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json(
        Response({
          message: "Receiver Id is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    const participants = [senderId, receiverId];

    const existingChat = await ChatModel.findOne({
      participants: { $all: participants },
    });

    if (existingChat) {
      return res.status(409).json(
        Response({
          message: "Chat already exists",
          status: "Failed",
          statusCode: 409,
        })
      );
    }

    const chatBody = {
      participants,
    };
    const chat = await ChatModel.create(chatBody);

    res.status(200).json(Response({
      data: chat,
      status: "OK",
      statusCode: 200,
      message: "Chat created successfully",
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Internal server error ${error.message}`,
      status: "Failed",
      statusCode: 500,
    });
  }
};


const getAllChatForUser = async (req, res) => {
try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(
            Response({
                message: "User not found",
                status: "Failed",
                statusCode: 404,
            })
        );
    }
    const chats = await ChatModel.find({
        participants: { $in: [userId] },
    }).populate("lastMessage participants");
    if(!chats){
        return res.status(404).json(
            Response({
                message: "Chat not found",
                status: "Failed",
                statusCode: 404,
            })
        );
    }

    res.status(200).json(Response({ data: chats, status: "OK", statusCode: 200, message: "Chats fetched successfully" }));
} catch (error) {
    console.log(error?.message);
    res.status(500).json(Response({ message: `Internal server error ${error?.message}`, status: "Failed", statusCode: 500 }));
}

};



module.exports = { createChat,getAllChatForUser };
