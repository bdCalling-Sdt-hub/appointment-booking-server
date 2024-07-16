const Response = require("../../helpers/response");
const AdminPercentageModel = require("../../models/AdminPercentage.model");
const User = require("../../models/User");

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

module.exports = { createPercentage };
