const Response = require("../../helpers/response");
const ChatModel = require("../../models/Chat.model");
const NotificationModel = require("../../models/Notification.model");
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
    const { receiverId, appointmentId } = req.body;

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
      appointmentId: appointmentId,
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
      appointmentId: appointmentId,
    };
    const chat = await ChatModel.create(chatBody);


    const receiverDetails = await User.findById(receiverId);


    const notificationForPatient = await NotificationModel.create(
      {
        message: `New Chat Created from ${receiverDetails?.firstName} ${receiverDetails?.lastName}`,
        role: "user",
        recipientId: receiverId,
      }
    );
    io.emit(`notification::${receiverId}`, notificationForPatient);

    res.status(200).json(
      Response({
        data: chat,
        status: "OK",
        statusCode: 200,
        message: "Chat created successfully",
      })
    );
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
    console.log("userId==============>",userId);
    
    // const chats = await ChatModel.find({
    //   participants: { $in: [userId] },
    // }).populate("lastMessage participants appointmentId");

    const chats = await ChatModel.find({
      participants: { $in: [userId] }
    })
    .populate([
      {
        path: 'lastMessage',
        // You can further populate fields within lastMessage if needed
        // populate: { path: 'someNestedField' }
      },
      {
        path: 'participants',
        // You can further populate fields within participants if needed
        // populate: { path: 'anotherNestedField' }
      },
      {
        path: 'appointmentId',
        // You can further populate fields within appointmentId if needed
        populate: { path: 'patientDetailsId' }
      },
      // {
      //   path: 'patientDetailsId',
      //   // You can further populate fields within patientDetailsId if needed
      //   // populate: { path: 'someOtherNestedField' }
      // }
    ])
    .exec();
    




console.log("chats==============>",chats);

    if (!chats) {
      return res.status(404).json(
        Response({
          message: "Chat not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    const incompleteAppointments = chats.filter(chat => chat?.appointmentId?.isCompleted !== true);
    console.log("incompleteAppointments", incompleteAppointments);
    

    if (!incompleteAppointments) {
      return res.status(404).json(
        Response({
          message: "Chat not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    console.log("incompleteAppointments", incompleteAppointments);

    res
      .status(200)
      .json(
        Response({
          data: incompleteAppointments,
          status: "OK",
          statusCode: 200,
          message: "Chats fetched successfully",
        })
      );
  } catch (error) {
    console.log(error?.message);
    res
      .status(500)
      .json(
        Response({
          message: `Internal server error ${error?.message}`,
          status: "Failed",
          statusCode: 500,
        })
      );
  }
};

module.exports = { createChat, getAllChatForUser };
