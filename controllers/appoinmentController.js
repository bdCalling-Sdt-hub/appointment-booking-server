const { log } = require("winston");
const Response = require("../helpers/response");
const DoctorDetailsModel = require("../models/DoctorDetails.model");
const PaymentModel = require("../models/Payment.model");

const User = require("../models/User");
const app = require("../app");
const PatientDetailsModel = require("../models/PatientDetails.model");
const DoctorPrescriptionModel = require("../models/DoctorPrescription.model");

const getAppointment = async (req, res) => {
  try {
    const { status } = req.query;
    if (status === "upcomming") {
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

        if (user.role !== "user") {
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

        const currentDate = new Date().toISOString().split("T")[0];
        // console.log("currentDate===>", currentDate);
        const totalDocument = await PaymentModel.countDocuments({
          date: { $gt: currentDate },
          patientId: user._id,
        });
        const appointments = await PaymentModel.find({
          date: { $gt: currentDate },
          patientId: user._id,
        })
          .populate("patientDetailsId doctorId patientId")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        if (!appointments || appointments.length === 0) {
          return res.status(404).json({
            statusCode: 404,
            message: "Appointments not found",
            status: "Failed",
          });
        }

        if (!appointments || appointments.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        for (let appointment of appointments) {
          appointment.status = "upcomming";
          // await appointment.save();
          await PaymentModel.updateOne(
            { _id: appointment._id },
            { $set: { status: "upcomming" } }
          );
          // console.log("=================>>>>>", appointment?.status); // Await the save operation to handle async properly
        }
        const result = appointments.filter(
          (appointment) => appointment.status === "upcomming"
        );

        res.status(200).json(
          Response({
            data: result,
            status: "OK",
            statusCode: 200,
            pagination: {
              totalPages: Math.ceil(result.length / limit),
              currentPage: page,
              prevPage: page > 1 ? page - 1 : null,
              nextPage:
                page < Math.ceil(result.length / limit) ? page + 1 : null,
              totalUsers: result.length,
            },
          })
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(
          Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          })
        );
      }
    } else if (status === "active") {
      try {
        const userId = req.userId;
        const user = await User.findById(userId);
        // console.log("=======>",user);
        if (!user) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "User not found",
              status: "Failed",
            })
          );
        }

        if (user.role !== "user") {
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

        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split("T")[0];
        const currentTimeString = currentDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        // console.log("currentDate============>", currentDateString);
        // console.log("currentDate===>",currentDate);
        const totalDocument = await PaymentModel.countDocuments({
          date: { $lte: currentDateString },
          patientId: user._id,
          isCompleted: false,
        });
        const appointments = await PaymentModel.find({
          date: { $lte: currentDateString },
          // timeSlot: { $lte: currentTimeString },
          patientId: user._id,
        })
          .populate("patientDetailsId doctorId patientId")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        if (!appointments || appointments.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        for (let appointment of appointments) {
          if (!appointment.isCompleted) {
            // appointment.status = "completed";
            // await appointment.save();
            appointment.status = "active";
            // await appointment.save();
            await PaymentModel.updateOne(
              { _id: appointment._id },
              { $set: { status: "active" } }
            );

            // console.log("=================>>>>>", appointment?.status);
          }
          // Await the save operation to handle async properly

          // console.log("=================>>>>>", appointment?.status); // Await the save operation to handle async properly
        }

        const result = appointments.filter(
          (appointment) => appointment.status === "active"
        );

        if (!result || result.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        res.status(200).json(
          Response({
            data: result,
            status: "OK",
            statusCode: 200,
            pagination: {
              totalPages: Math.ceil(totalDocument / limit),
              currentPage: page,
              prevPage: page > 1 ? page - 1 : null,
              nextPage:
                page < Math.ceil(totalDocument / limit) ? page + 1 : null,
              totalUsers: totalDocument,
            },
          })
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(
          Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          })
        );
      }
    } else if (status === "completed") {
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

        if (user.role !== "user") {
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

        const currentDate = new Date().toDateString().split("T")[0];
        const totalDocument = await PaymentModel.countDocuments({
          date: { $gte: currentDate },
          patientId: user._id,
        });
        const appointments = await PaymentModel.find({
          date: { $lte: currentDate },
          patientId: user._id,
        })
          .sort({ createdAt: -1 })
          .populate("patientDetailsId doctorId patientId")
          .skip((page - 1) * limit)
          .limit(limit);

        if (!appointments || appointments.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        for (let appointment of appointments) {
          if (appointment.isCompleted) {
            // appointment.status = "completed";
            // await appointment.save();
            await PaymentModel.updateOne(
              { _id: appointment._id },
              { $set: { status: "completed" } }
            );
            console.log("=================>>>>>", appointment?.status);
          }
          // Await the save operation to handle async properly
        }
        const result = appointments.filter(
          (appointment) => appointment.status === "completed"
        );

        res.status(200).json(
          Response({
            data: result,
            status: "OK",
            statusCode: 200,
            pagination: {
              totalPages: Math.ceil(result.length / limit),
              currentPage: page,
              prevPage: page > 1 ? page - 1 : null,
              nextPage:
                page < Math.ceil(result.length / limit) ? page + 1 : null,
              totalUsers: result.length,
            },
          })
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(
          Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          })
        );
      }
    } else {
      res.status(404).json(
        Response({
          message: "Invalid status",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
  } catch (error) {
    // console.log(error?.message);
    res
      .status(500)
      .json(
        Response({ message: error.message, status: "Failed", statusCode: 500 })
      );
  }
};

const getSingleAppointment = async (req, res) => {
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
    // if(user?.role !== "doctor"){
    //     return res.status(404).json(Response({ message: "You are not authorized to perform this action", status: "Failed", statusCode: 403 }));
    // }
    const appointmentId = req.params.appointmentId;
    // console.log("appointmentId", appointmentId);
    if (!appointmentId) {
      return res.status(404).json(
        Response({
          message: "Appointment not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    // console.log("appointmentId", appointmentId);
    const appointment = await PaymentModel.findById(appointmentId).populate(
      "patientDetailsId doctorId patientId"
    );

    const doctorDetails = await DoctorDetailsModel.findOne({
      doctorId: appointment.doctorId._id,
    }).lean();

    // console.log(
    //   "doctorDetails=========================>",
    //   doctorDetails?.specialist
    // );
    const getPatientDetails = await DoctorPrescriptionModel.findOne({
      patientDetailsId: appointment.patientDetailsId._id,
    });

    console.log(
      "getPatientDetails=========================>",
      getPatientDetails
    );

    let result = {
      ...appointment._doc,
      specialist: doctorDetails?.specialist,
      prescription: getPatientDetails?.file,
    };

    // console.log("result=========================>", result);
    if (!appointment) {
      return res.status(404).json(
        Response({
          message: "Appointment not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
    res
      .status(200)
      .json(Response({ data: result, status: "OK", statusCode: 200 }));
  } catch (error) {
    console.error(error?.message);
    res.status(500).json(
      Response({
        message: `${error?.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const getAppointmentForDoctor = async (req, res) => {
  try {
    const { status } = req.query;
    if (status === "upcomming") {
      try {
        const userId = req.userId;
        const user = await User.findById(userId);
        console.log("userId", user);
        if (!user) {
          return res.status(404).json({
            statusCode: 404,
            message: "User not found",
            status: "Failed",
          });
        }

        if (user.role !== "doctor") {
          return res.status(403).json({
            message: "You are not authorized to perform this action",
            status: "Failed",
            statusCode: 403,
          });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const currentDate = new Date().toISOString().split("T")[0];
        const totalDocument = await PaymentModel.countDocuments({
          date: { $gt: currentDate },
          doctorId: user._id,
        });
        const appointments = await PaymentModel.find({
          date: { $gt: currentDate },
          doctorId: user._id,
        })
          .populate("patientDetailsId doctorId patientId")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        if (!appointments || appointments.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        for (let appointment of appointments) {
          appointment.status = "upcomming";
          // await appointment.save();
          await PaymentModel.updateOne(
            { _id: appointment._id },
            { $set: { status: "upcomming" } }
          );
          console.log("=================>>>>>", appointment?.status); // Await the save operation to handle async properly
        }
        const result = appointments.filter(
          (appointment) => appointment.status === "upcomming"
        );

        res.status(200).json(
          Response({
            data: result,
            status: "OK",
            statusCode: 200,
            pagination: {
              totalPages: Math.ceil(result.length / limit),
              currentPage: page,
              prevPage: page > 1 ? page - 1 : null,
              nextPage:
                page < Math.ceil(result.length / limit) ? page + 1 : null,
              totalUsers: result.length,
            },
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
    } else if (status === "active") {
      try {
        const userId = req.userId;
        const user = await User.findById(userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // console.log("=======>",user);
        if (!user) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "User not found",
              status: "Failed",
            })
          );
        }

        if (user.role !== "doctor") {
          return res.status(403).json(
            Response({
              message: "You are not authorized to perform this action",
              status: "Failed",
              statusCode: 403,
            })
          );
        }

        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split("T")[0];
        const currentTimeString = currentDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        // console.log(currentDateString, currentTimeString);
        const totalDocument = await PaymentModel.countDocuments({
          date: { $lte: currentDateString },
          doctorId: user._id,
        });
        const appointments = await PaymentModel.find({
          date: { $lte: currentDateString },
          // timeSlot: { $lte: currentTimeString },
          doctorId: user._id,
        })
          .populate("patientDetailsId doctorId patientId")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        if (!appointments || appointments.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }
        for (let appointment of appointments) {
          appointment.status = "active";
          // await appointment.save();
          await PaymentModel.updateOne(
            { _id: appointment._id },
            { $set: { status: "active" } }
          );
          // console.log("=================>>>>>", appointment?.status); // Await the save operation to handle async properly
        }

        const result = appointments.filter(
          (appointment) => appointment.status === "active"
        );

        if (!result || result.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        res.status(200).json(
          Response({
            data: result,
            status: "OK",
            statusCode: 200,
            pagination: {
              totalPages: Math.ceil(totalDocument / limit),
              currentPage: page,
              prevPage: page > 1 ? page - 1 : null,
              nextPage:
                page < Math.ceil(totalDocument / limit) ? page + 1 : null,
              totalUsers: totalDocument,
            },
          })
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(
          Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          })
        );
      }
    } else if (status === "completed") {
      try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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

        if (user.role !== "doctor") {
          return res.status(403).json(
            Response({
              message: "You are not authorized to perform this action",
              status: "Failed",
              statusCode: 403,
            })
          );
        }

        const currentDate = new Date().toISOString().split("T")[0];
        const totalDocument = await PaymentModel.countDocuments({
          date: { $gte: currentDate },
          doctorId: user._id,
        });
        const appointments = await PaymentModel.find({
          date: { $lte: currentDate },
          doctorId: user._id,
        }).populate("patientDetailsId doctorId patientId");

        if (!appointments || appointments.length === 0) {
          return res.status(404).json(
            Response({
              statusCode: 404,
              message: "Appointments not found",
              status: "Failed",
            })
          );
        }

        for (let appointment of appointments) {
          if (appointment.isCompleted) {
            // appointment.status = "completed";
            // await appointment.save();
            await PaymentModel.updateOne(
              { _id: appointment._id },
              { $set: { status: "completed" } }
            );
            // console.log("=================>>>>>", appointment?.status);
          }
          // Await the save operation to handle async properly
        }
        const result = appointments.filter(
          (appointment) => appointment.status === "completed"
        );

        res.status(200).json(
          Response({
            data: result,
            status: "OK",
            statusCode: 200,
            pagination: {
              totalPages: Math.ceil(result.length / limit),
              currentPage: page,
              prevPage: page > 1 ? page - 1 : null,
              nextPage:
                page < Math.ceil(result.length / limit) ? page + 1 : null,
              totalUsers: result.length,
            },
          })
        );
      } catch (error) {
        console.error(error);
        res.status(500).json(
          Response({
            message: `Internal server error ${error.message}`,
            status: "Failed",
            statusCode: 500,
          })
        );
      }
    } else {
      res.status(404).json(
        Response({
          message: "Invalid status",
          status: "Failed",
          statusCode: 404,
        })
      );
    }
  } catch (error) {
    console.log(error?.message);
    res
      .status(500)
      .json(
        Response({ message: error.message, status: "Failed", statusCode: 500 })
      );
  }
};

module.exports = {
  getAppointment,
  getSingleAppointment,
  getAppointmentForDoctor,
};
