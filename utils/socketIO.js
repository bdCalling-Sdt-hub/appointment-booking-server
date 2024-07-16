const Response = require("../helpers/response");
const ChatModel = require("../models/Chat.model");
const MessageModel = require("../models/Message.model");

const socketIO = (io) => {
    io.on("connection", (socket) => {
      console.log(`ID: ${socket.id} just connected`);


      socket.on("send-message", async (data, callback) => {
        try {
          const { message, receiverId, senderId} =  data;
          const messageBody = {
            content: {
              messageType:"text",
              message,
            },
            senderId,
            receiverId,
          };
          const participants = [senderId, receiverId];
          const existingChat = await ChatModel.findOne({
            participants: { $all: participants },
          });
          let chatId;
          if(existingChat){
            chatId = existingChat._id;
          }else{
            const chatBody = {
              participants,
            };
            const newChat = await ChatModel.create(chatBody);
            chatId = newChat._id;
          }
          messageBody.chatId = chatId;
          console.log("chatId=====>",chatId);
          const messageCreate = await MessageModel.create(messageBody);
          const messageEvent = `lastMessage::${chatId}`;
          io.emit(messageEvent, messageCreate);

          const chat = await ChatModel.findByIdAndUpdate(chatId, {
            lastMessage: messageCreate?._id,
          });
          const newChatEvent = `chat::${receiverId}`;
          io.emit(newChatEvent, chat);
          callback(Response({
            data: messageCreate,
            status: "OK",
            statusCode: 200,
            message: "Message created successfully",
          }));
        } catch (error) {
          callback(Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          }))
        }
      })

      socket.on("delete-message", async (data, callback) => {
        try {
          const { messageId,senderId } = data;
           await MessageModel.findByIdAndDelete(messageId);

           // Emit a notification or confirmation
        io.emit(`message-deleted`, {
          message: "Message deleted successfully",
        });

        callback(
          Response({
            statusCode: 200,
            type: "success",
            message: "Message deleted successfully",
          })
        );
        } catch (error) {
          console.log(error?.message);
          callback(Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          }));
        }

      })



  
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