const Response = require("../../helpers/response");
const AdminPercentageModel = require("../../models/AdminPercentage.model");
const User = require("../../models/User");
const withdrawModel = require("../../models/withdraw.model");
const AdminEarningModel = require("../../models/withdraw.model");
const AppointmentModel = require("../../models/Payment.model");

const createPercentage = async (req, res) => {
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
    // if (user?.role !== "admin") {
    //   return res.status(404).json(
    //     Response({
    //       message: "You are not authorized to perform this action",
    //       status: "Failed",
    //       statusCode: 403,
    //     })
    //   );
    // }

    const { percentage } = req.body;
    if (!percentage) {
      return res.status(400).json(
        Response({
          message: "Percentage is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    const createPercentage = await AdminPercentageModel.create({
      percentage,
    });

    if (createPercentage) {
      return res.status(200).json(
        Response({
          data: createPercentage,
          status: "OK",
          statusCode: 200,
          message: "Percentage created successfully",
        })
      );
    }
  } catch (error) {
    console.log(error?.message);
    res.status(500).json(
      Response({
        message: `Internal server error ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const getAllWithdrawals = async (req, res) => {
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

    // if (user?.role !== "admin") {
    //   return res.status(404).json(
    //     Response({
    //       message: "You are not authorized to perform this action",
    //       status: "Failed",
    //       statusCode: 403,
    //     })
    //   )
    // }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  

    const withdrawals = await AdminEarningModel.find({}).populate("doctorId").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
   const totalWithdraws = await AdminEarningModel.countDocuments({});
    res.status(200).json(
      Response({
        message: "Withdrawals fetched successfully",
        data: withdrawals,
        status: "OK",
        statusCode: 200,
        pagination: {
          totalPages: Math.ceil(totalWithdraws / limit),
          currentPage: page,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalWithdraws / limit) ? page + 1 : null,
          totalUsers: totalWithdraws,
        },
      })
    );
  } catch (error) {
    console.log(error?.message);
    res.status(500).json(
      Response({
        message: `Internal server error ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
}

const updateWithdrawalRequest = async (req, res) => {
  try {
    const { id, status } = req.body;
    
    // Check if ID and status are provided
    if (!id || !status) {
      return res.status(400).json({
        message: "Id and status are required",
        status: "Failed",
        statusCode: 400,
      });
    }

    // Validate the user making the request (admin check)
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json(Response({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      }));
    }

    // Find and update the withdrawal request
    const withdrawalRequest = await withdrawModel.findByIdAndUpdate(
      id,
      { status: status }, // Fields to update
      { new: true, runValidators: true } // Options: return the updated document
    );

    // Check if the document was found and updated
    if (!withdrawalRequest) {
      return res.status(404).json(Response({
        message: "Withdrawal request not found",
        status: "Failed",
        statusCode: 404,
      }));
    }

    res.status(200).json(Response({
      data: withdrawalRequest,
      message: "Withdrawal request updated successfully",
      status: "OK",
      statusCode: 200,
    }));
  } catch (error) {
    console.error("Error updating withdrawal request:", error.message);
    res.status(500).json(Response({
      message: `Internal server error: ${error.message}`,
      status: "Failed",
      statusCode: 500,
    }));
  }
};


const getAllAppointments = async (req, res) => {
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
    if(!user.role === "admin"){
      return res.status(403).json(Response({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      }))
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const appointments = await AppointmentModel.find({}).populate("doctorId").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const totalAppointments = await AppointmentModel.countDocuments({});
    res.status(200).json(
      Response({
        message: "Appointments fetched successfully",
        data: appointments,
        status: "OK",
        statusCode: 200,
        pagination: {
          totalPages: Math.ceil(totalAppointments / limit),
          currentPage: page,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalAppointments / limit) ? page + 1 : null,
          totalUsers: totalAppointments,
        },
      })
    );
  } catch (error) {
    console.log(error?.message);
    res.status(500).json(
      Response({
        message: `Internal server error ${error?.message}`,
        status: "Failed",
        statusCode: 500,
      })
    )
  }
}




module.exports = { createPercentage,getAllWithdrawals,updateWithdrawalRequest,getAllAppointments };
