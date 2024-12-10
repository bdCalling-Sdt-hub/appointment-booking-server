
const Response = require("../helpers/response");
const NotificationModel = require("../models/Notification.model");
const User = require("../models/User");

const getAllNotification = async (req, res) => {
    try {
        const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json(Response({ message: 'User not found', status: "Failed", statusCode: 404 }));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(page);
    // console.log(limit);
    



    const getNotification = await NotificationModel.find({ recipientId: userId }).populate('recipientId').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);


    const totalNotification = await NotificationModel.countDocuments({ recipientId: userId });

    if(getNotification.length === 0) {
        return res.status(404).json(Response({ message: 'No notification found', status: "Failed", statusCode: 404 }));
    }
    

    res.status(200).json(Response({ message: 'Notification fetched successfully', data: getNotification, 
        pagination: {
            totalPages: Math.ceil(totalNotification / limit),
            currentPage: page,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(totalNotification / limit) ? page + 1 : null,
            totalUsers: totalNotification,
          },
    }));
        
    } catch (error) {
        console.log("notification", error?.message);
        res.status(500).json(Response({ message: error?.message, status: "Failed", statusCode: 500 }));
    }


}




module.exports = getAllNotification