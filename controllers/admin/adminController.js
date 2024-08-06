const Response = require("../../helpers/response");
const AdminPercentageModel = require("../../models/AdminPercentage.model");
const User = require("../../models/User");
const withdrawModel = require("../../models/withdraw.model");
const AdminEarningModel = require("../../models/withdraw.model");
const AppointmentModel = require("../../models/Payment.model");
const DoctorDetailsModel = require("../../models/DoctorDetails.model");
const NotificationModel = require("../../models/Notification.model");
// const Percentage = require("../../models/Percentage.model");
// const PercentageModel = require("../../models/Percentage.model");

// const createPercentage = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json(
//         Response({
//           message: "User not found",
//           status: "Failed",
//           statusCode: 404,
//         })
//       );
//     }
//     // if (user?.role !== "admin") {
//     //   return res.status(404).json(
//     //     Response({
//     //       message: "You are not authorized to perform this action",
//     //       status: "Failed",
//     //       statusCode: 403,
//     //     })
//     //   );
//     // }

//     const { percentage } = req.body;
//     if (!percentage) {
//       return res.status(400).json(
//         Response({
//           message: "Percentage is required",
//           status: "Failed",
//           statusCode: 400,
//         })
//       );
//     }

//     const createPercentage = await AdminPercentageModel.create({
//       percentage,
//     });

//     if (createPercentage) {
//       return res.status(200).json(
//         Response({
//           data: createPercentage,
//           status: "OK",
//           statusCode: 200,
//           message: "Percentage created successfully",
//         })
//       );
//     }
//   } catch (error) {
//     console.log(error?.message);
//     res.status(500).json(
//       Response({
//         message: `Internal server error ${error.message}`,
//         status: "Failed",
//         statusCode: 500,
//       })
//     );
//   }
// };

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

    const withdrawals = await AdminEarningModel.find({})
      .populate("doctorId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
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
};

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
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    // Find and update the withdrawal request
    const withdrawalRequest = await withdrawModel.findByIdAndUpdate(
      id,
      { status: status }, // Fields to update
      { new: true, runValidators: true } // Options: return the updated document
    );

    // Check if the document was found and updated
    if (!withdrawalRequest) {
      return res.status(404).json(
        Response({
          message: "Withdrawal request not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    // Return the updated document
    const notification = await NotificationModel.create({
      message: `Withdrawal request ${status}`,
      role: "doctor",
      recipientId: withdrawalRequest.doctorId,
    })

    io.emit(`notification::${withdrawalRequest.doctorId}`, notification);

    res.status(200).json(
      Response({
        data: withdrawalRequest,
        message: "Withdrawal request updated successfully",
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.error("Error updating withdrawal request:", error.message);
    res.status(500).json(
      Response({
        message: `Internal server error: ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
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
    if (!user.role === "admin") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const appointments = await AppointmentModel.find({})
      .populate("doctorId patientId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
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
          nextPage:
            page < Math.ceil(totalAppointments / limit) ? page + 1 : null,
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
    );
  }
};

const getAllDoctors = async (req, res) => {
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
    if (!user.role === "admin") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const doctors = await DoctorDetailsModel.find({})
      .populate("doctorId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalUsers = await DoctorDetailsModel.countDocuments({});

    res.status(200).json(
      Response({
        message: "Users fetched successfully",
        data: doctors,
        status: "OK",
        statusCode: 200,
        pagination: {
          totalPages: Math.ceil(totalUsers / limit),
          currentPage: page,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalUsers / limit) ? page + 1 : null,
          totalUsers: totalUsers,
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
    );
  }
};

const getAllUser = async (req, res) => {
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
    if (!user.role === "admin") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalUsers = await User.countDocuments({});

    res.status(200).json(
      Response({
        message: "Users fetched successfully",
        data: users,
        status: "OK",
        statusCode: 200,
        pagination: {
          totalPages: Math.ceil(totalUsers / limit),
          currentPage: page,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalUsers / limit) ? page + 1 : null,
          totalUsers: totalUsers,
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
    );
  }
};

const createPercentageAmount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const { percentageAmount } = req.body;

    if (!percentageAmount) {
      return res.status(400).json({
        message: "Percentage amount is required",
        status: "Failed",
        statusCode: 400,
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "Failed",
        statusCode: 404,
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      });
    }

    let percentage = await AdminPercentageModel.findOne();
    console.log("==================>", percentage);
    if (percentage) {
      percentage.percentage = percentageAmount;
      await percentage.save();
      return res.status(200).json({
        message: "Percentage amount updated successfully",
        data: percentage,
        status: "OK",
        statusCode: 200,
      });
    } else {
      percentage = new AdminPercentageModel({ amount: percentageAmount });
      await percentage.save();
      return res.status(201).json({
        message: "Percentage amount created successfully",
        data: percentage,
        status: "OK",
        statusCode: 201,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `Internal server error ${error.message}`,
      status: "Failed",
      statusCode: 500,
    });
  }
};

const getPercentageAmount = async (req, res) => {
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

    if (user.role !== "admin") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }
    const percentage = await AdminPercentageModel.findOne();
    console.log("================>>>>>>", percentage);

    if (!percentage) {
      return res.status(404).json(
        Response({
          message: "Percentage not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    res.status(200).json(
      Response({
        message: "Percentage fetched successfully",
        data: percentage,
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log("adminController", error?.message);
    res.status(500).json(
      Response({
        message: `Internal server error ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};


const getEarningStatus = async (req, res) => {
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

    if (user.role !== "admin") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }
    const totalEarnings = await AppointmentModel.aggregate([
      {
        $group: {
          _id: null,
          totalAdminAmount: { $sum: "$adminAmount" },
          totalAmount: { $sum: "$amount" },
          paymentCount: { $sum: 1 }
        }
      }
    ]);

    const totalUser = await User.countDocuments({ role: "user" });

    const totalAdmin = await User.countDocuments({ role: "admin" });
    const totalDoctor = await User.countDocuments({ role: "doctor" });

    const totalAdminAmount = totalEarnings.length > 0 ? totalEarnings[0].totalAdminAmount : 0;
    const totalAmount = totalEarnings.length > 0 ? totalEarnings[0].totalAmount : 0;
    const paymentCount = totalEarnings.length > 0 ? totalEarnings[0].paymentCount : 0;

    console.log("================>>>>>> Total Admin Amount:", totalAdminAmount);
    console.log("================>>>>>> Total Amount:", totalAmount);

    res.status(200).json(
      Response({
        message: "Percentage fetched successfully",
        data: { totalAdminAmount, totalAmount, paymentCount,totalUser,totalDoctor },
        status: "OK",
        statusCode: 200,
      })
    )
  } catch (error) {
    console.log("adminController", error?.message);
    res.status(500).json(
      Response({
        message: `Internal server error ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
}

const getChartData = async (req, res) => {
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

    if (user.role !== "admin") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    let { year } = req.query;

    if (!year) {
      const currentDate = new Date();
      year = currentDate.getFullYear().toString();
    }
  
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999`);
  
    const data = await AppointmentModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
    ]);
  
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(year, i, 1).toLocaleString("en-us", {
        month: "short",
      });
      const total = data.reduce((acc, payment) => {
        const paymentMonth = new Date(payment.createdAt).getMonth();
        if (paymentMonth === i) {
          return acc + payment.amount;
        }
        return acc;
      }, 0);
      return { name: month, price: total };
    });
  
    res
      .status(200)
      .json(
        Response({
          message: "Data fetched successfully",
          statusCode: 200,
          data: monthlyData,
        })
      );
  
    
  } catch (error) {
    console.log("adminController", error?.message);
    res
    .status(200)
    .json(
      Response({
        message: `Internal server error ${error.message}`,
        statusCode: 500,
      })
    );

  }

 


};




module.exports = {
  getAllWithdrawals,
  updateWithdrawalRequest,
  getAllAppointments,
  getAllDoctors,
  getAllUser,
  createPercentageAmount,
  getPercentageAmount,
  getEarningStatus,
  getChartData
};


