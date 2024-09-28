const Response = require("../helpers/response");
const ChatModel = require("../models/Chat.model");
const MessageModel = require("../models/Message.model");

const socketIO = (io) => {
  io.on("connection", (socket) => {
    console.log(`ID: ${socket.id} just connected`);

    // socket.on("send-message", async (data, callback) => {
    //   try {
    //     const { message, receiverId, senderId} =  data;
    //     const messageBody = {
    //       content: {
    //         messageType:"text",
    //         message,
    //       },
    //       senderId,
    //       receiverId,
    //     };
    //     const participants = [senderId, receiverId];
    //     const existingChat = await ChatModel.findOne({
    //       participants: { $all: participants },
    //     });

    //     let chatId;
    //     if(existingChat){
    //       chatId = existingChat._id;
    //     }else{
    //       const chatBody = {
    //         participants,
    //       };
    //       const newChat = await ChatModel.create(chatBody);
    //       chatId = newChat._id;
    //     }
    //     messageBody.chatId = chatId;
    //     console.log("chatId=====>",chatId);
    //     const messageCreate = await MessageModel.create(messageBody);
    //     const messageEvent = `lastMessage::${chatId}`;
    //     io.emit(messageEvent, messageCreate);

    //     const chat = await ChatModel.findByIdAndUpdate(chatId, {
    //       lastMessage: messageCreate?._id,
    //     });
    //     const newChatEvent = `chat::${receiverId}`;
    //     io.emit(newChatEvent, chat);
    //     callback(Response({
    //       data: messageCreate,
    //       status: "OK",
    //       statusCode: 200,
    //       message: "Message created successfully",
    //     }));
    //   } catch (error) {
    //     callback(Response({
    //       message: `Internal server error ${error.message}`,
    //       status: "Failed",
    //       statusCode: 500,
    //     }))
    //   }
    // })

    socket.on("send-message", async (data, callback) => {
      try {
        const { message, receiverId, senderId, chatId } = data;
        const messageBody = {
          content: {
            messageType: "text",
            message,
          },
          senderId,
          receiverId,
          chatId,
        };

        // console.log("======================>>>>>>>>>>>>>>>>>>>", messageBody);
        // const participants = [senderId, receiverId];
        const existingChat = await ChatModel.findOne({
          _id: chatId,
        });
        // console.log("existingChat=====>", existingChat);
        if (!existingChat) {
          if (typeof callback === "function") {
            callback({
              message: "Chat not found",
              status: "Failed",
              statusCode: 404,
            });
          }
          return;
        }

        // let chatId;
        // if(existingChat){
        //   chatId = existingChat._id;
        // }else{
        //   const chatBody = {
        //     participants,
        //   };
        //   const newChat = await ChatModel.create(chatBody);
        //   chatId = newChat._id;
        // }
        // messageBody.chatId = chatId;
        // console.log("chatId=====>",chatId);
        const messageCreate = await MessageModel.create(messageBody);
        console.log("messageCreate=====>", messageCreate);
        const lastMessageEvent = await MessageModel.findOne({
          _id: messageCreate?._id
        }).populate("senderId receiverId")
        console.log("lastMessageEvent=====>", lastMessageEvent);
        const messageEvent = `lastMessage::${chatId}`;
        console.log("================>>>>>>>>>",messageCreate);
        io.emit(messageEvent, lastMessageEvent);

        const chat = await ChatModel.findByIdAndUpdate(chatId, {
          lastMessage: messageCreate?._id,
        });
        const newChatEvent = `chat::${receiverId}`;
        io.emit(newChatEvent, chat);
        if (typeof callback === "function") {
          callback({
            data: messageCreate,
            status: "OK",
            statusCode: 200,
            message: "Message created successfully",
          });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          });
        }
      }
    });

    socket.on("delete-message", async (data, callback) => {
      try {
        const { messageId, senderId } = data;
        await MessageModel.findByIdAndDelete(messageId);

        // Emit a notification or confirmation
        io.emit(`message-deleted`, {
          message: "Message deleted successfully",
        });

        if (typeof callback === "function") {
          callback({
            statusCode: 200,
            type: "success",
            message: "Message deleted successfully",
          });
        }
      } catch (error) {
        console.log(error?.message);
        if (typeof callback === "function") {
          callback({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          });
        }
      }
    });

    socket.on("join-room", (data, callback) => {
      //console.log('someone wants to join--->', data);
      if (data?.roomId) {
        socket.join("room" + data.roomId);
        callback("Join room successful");
      } else {
        callback("Must provide a valid user id");
      }
    });

    socket.on("leave-room", (data) => {
      if (data?.roomId) {
        socket.leave("room" + data.roomId);
      }
    });

    socket.on("disconnect", () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
  });
};


module.exports = socketIO;
