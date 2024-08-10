const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Response = require("../helpers/response");
const AdminPercentageModel = require("../models/AdminPercentage.model");
const DoctorDetailsModel = require("../models/DoctorDetails.model");
const doctorEarningModel = require("../models/doctorEarning.model");
const NotificationModel = require("../models/Notification.model");
const PatientDetailsModel = require("../models/PatientDetails.model");
const PaymentModel = require("../models/Payment.model");
// const AdminPercentageModel = require("../models/Percentage.model");

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
    // console.log("customer===>", customer);

    const charge = await stripe.charges.create({
      amount: req.body.amount * 100,
      currency: "usd",
      customer: customer.id,
      description: "Thank you For Your Payment for appointment",
    });

    // console.log("============================>", charge);

    const { date, timeSlot, doctorId, package, patientDetailsId } = req.body;
    // console.log("==============>>>>>>>>>>>>>>>>>>",req.body);
    // console.log("date==========>", date);

    if (!date) {
      return res.status(404).json(
        Response({
          message: "Date is required",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    if (!patientDetailsId) {
      return res.status(404).json(
        Response({
          message: "Patient Details Id is required",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // console.log("formattedDate===>", formattedDate);

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
      _id: patientDetailsId,
    });
    // console.log("======================>>>>>>>details",patientDetails);

    if (!patientDetails) {
      return res.status(404).json(
        Response({
          message: "Patient Details not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    const adminPercentage = await AdminPercentageModel.find();
    if (adminPercentage.length === 0) {
      return res.status(404).json(
        Response({
          message: "Admin Percentage not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    console.log("================>>>>>>>>>", adminPercentage);

    console.log(adminPercentage?.percentage);
    const adminIncome =
      (charge.amount / 100) * (adminPercentage[0].percentageAmount / 100) || 0;

    console.log(charge.status === "succeeded");

    // Check if payment was successful
    if (charge.status === "succeeded") {
      const paymentData = {
        amount: charge.amount / 100,
        patientId: userId,
        transactionId: charge.id,
        date: formattedDate,
        timeSlot: timeSlot,
        doctorId: doctorId,
        package: package,
        adminAmount: adminIncome,
        // paymentData:charge,
        patientDetailsId: patientDetails._id,
      };

      const newPayment = await PaymentModel.create(paymentData);

      const getPercentages = await AdminPercentageModel.find();
      console.log(getPercentages[0].percentage);

      if (!getPercentages) {
        return res.status(404).json(
          Response({
            message: "Admin Percentage not found",
            status: "Failed",
            statusCode: 404,
          })
        );
      }
console.log("priceeeeeeeeeeeeeeeeeee",paymentData?.amount -
  paymentData.amount * (getPercentages[0].percentageAmount / 100));

      await doctorEarningModel.create({
        patientId: userId,
        price: Number(
          paymentData?.amount -
            paymentData.amount * (getPercentages[0].percentageAmount / 100)
        ),

        doctorId: doctorId,
      });

      const findDoctor = await DoctorDetailsModel.findOne({
        _id: doctorId,
      });
      const notificationForUser = await NotificationModel.create({
        message: `Payment done successfully for Doctor ${findDoctor?.firstName} ${findDoctor?.lastName}`,
        recipientId: userId,
        role: "user",
        read: false,
      });

      io.emit(`notification::${userId}`, notificationForUser);

      const notificationForDoctor = await NotificationModel.create({
        message: `Payment done successfully for Patient ${patientDetails?.firstName} ${patientDetails?.lastName}`,
        recipientId: doctorId,
        role: "doctor",
        read: false,
      });

      io.emit(`notification::${doctorId}`, notificationForDoctor);

      const notificationForAdmin = await NotificationModel.create({
        message: `Payment done successfully for ${patientDetails?.firstName} ${patientDetails?.lastName} and Doctor ${findDoctor?.firstName} ${findDoctor?.lastName}`,
        recipientId: doctorId,
        role: "admin",
        read: false,
      });

      // io.emit(`notification::admin`, notificationForAdmin);

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
    console.log(error)
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
