const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Response = require("../helpers/response");
const AdminPercentageModel = require("../models/AdminPercentage.model");
const doctorEarningModel = require("../models/doctorEarning.model");
const PatientDetailsModel = require("../models/PatientDetails.model");
const PaymentModel = require("../models/Payment.model");

const User = require("../models/User");

const paymentCreate = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(
        Response({
          statusCode: 404,
          message: "User not found",
          status: "Failed",
        })
      );
    }
    if (user?.role !== "user") {
      return res.status(404).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    // Create a new customer with the provided name, email, and stripeToken
    const customer = await stripe.customers.create({
      source: req.body.stripeToken,
    });

    const charge = await stripe.charges.create({
      amount: req.body.amount * 100,
      currency: "usd",
      customer: customer.id,
      description: "Thank you For Your Payment for appointment",
    });

    const { date, timeSlot, doctorId, package } = req.body;

    if (!timeSlot) {
      return res.status(404).json(
        Response({
          message: "Time Slot is required",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    if (!doctorId) {
      return res.status(404).json(
        Response({
          message: "Doctor Id is required",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    const patientDetails = await PatientDetailsModel.findOne({
      patientId: userId,
      doctorId: doctorId,
    });
    console.log(patientDetails);

    if (!patientDetails) {
      return res.status(404).json(
        Response({
          message: "Patient Details not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    // Check if payment was successful
    if (charge.status === "succeeded") {
      const paymentData = {
        amount: charge.amount / 100,
        patientId: userId,
        transactionId: charge.id,
        date: date,
        timeSlot: timeSlot,
        doctorId: doctorId,
        package: package,
        // paymentData:charge,
        patientDetailsId: patientDetails._id,
      };

      const newPayment = await PaymentModel.create(paymentData);

      const getPercentages = await AdminPercentageModel.find();
      console.log(getPercentages[0].percentage);

      await doctorEarningModel.create({
        patientId: userId,
        price:
          paymentData.amount -
          paymentData.amount * (getPercentages[0].percentage / 100),
        doctorId: doctorId,
      });

      return res.status(200).json(
        Response({
          message: "Payment created successfully",
          data: newPayment,
          status: "OK",
          statusCode: 200,
        })
      );
    } else {
      return res.status(400).json(
        Response({
          message: "Payment failed",
          status: "Failed",
          statusCode: 400,
        })
      );
    }
  } catch (error) {
    res.status(500).json(
      Response({
        message: `Internal server error ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

module.exports = { paymentCreate };
