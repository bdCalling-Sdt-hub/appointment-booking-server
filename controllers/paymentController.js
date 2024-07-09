const Response = require("../helpers/response");
const PaymentModel = require("../models/Payment.model");

const User = require("../models/User");

const paymentCreate = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(
          Response({
            statusCode: 404,
            message: "User not found",
            status: "Failed",
          })
        );
    }
    if (user?.role !== "user") {
      return res
        .status(404)
        .json(
          Response({
            message: "You are not authorized to perform this action",
            status: "Failed",
            statusCode: 403,
          })
        );
    }
    const {
      transactionId,
      price,
      date,
      timeSlot,
      patientDetailsId,
      doctorId,
      paymentData,
    } = req.body;
    if (!transactionId) {
      return res
        .status(404)
        .json(
          Response({
            message: "Transaction Id is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if (!price) {
      return res
        .status(404)
        .json(
          Response({
            message: "Price is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if (!date) {
      return res
        .status(404)
        .json(
          Response({
            message: "Date is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if (!timeSlot) {
      return res
        .status(404)
        .json(
          Response({
            message: "Time Slot is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if (!patientDetailsId) {
      return res
        .status(404)
        .json(
          Response({
            message: "Patient Details Id is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if (!doctorId) {
      return res
        .status(404)
        .json(
          Response({
            message: "Doctor Id is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }
    if (!paymentData) {
      return res
        .status(404)
        .json(
          Response({
            message: "Payment Data is required",
            status: "Failed",
            statusCode: 404,
          })
        );
    }

    const newPayment = await PaymentModel.create({
      transactionId,
      price,
      date,
      timeSlot,
      patientDetailsId,
      doctorId,
      paymentData,
    });

    res
      .status(200)
      .json(
        Response({
          message: "Payment created successfully",
          data: newPayment,
          status: "OK",
          statusCode: 200,
        })
      );
  } catch (error) {
    res
      .status(500)
      .json(
        Response({
          message: `Internal server error ${error.message}`,
          status: "Failed",
          statusCode: 500,
        })
      );
  }
};

module.exports = { paymentCreate };
