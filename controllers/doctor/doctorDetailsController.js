const Response = require("../../helpers/response");
const DoctorDetailsModel = require("../../models/DoctorDetails.model");
const doctorEarningModel = require("../../models/doctorEarning.model");
const DoctorPrescriptionModel = require("../../models/DoctorPrescription.model");
const ReviewModel = require("../../models/Review.model");
const User = require("../../models/User");
const moment = require("moment");
const withdrawalModel = require("../../models/withdraw.model");
const PaymentModel = require("../../models/Payment.model");
const NotificationModel = require("../../models/Notification.model");
const pagination = require("../../helpers/pagination");

function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  console.log("=======================>review", averageRating);

  return averageRating;
}

// Function to generate time slots array between startTime and endTime
// function generateTimeSlots(startTime, endTime) {
//   const timeSlots = [];
//   let currentTime = new Date(`2024-01-01T${startTime}`);
//   const endTimeObj = new Date(`2024-01-01T${endTime}`);
//   console.log(currentTime, endTimeObj);

//   while (currentTime <= endTimeObj) {
//     timeSlots.push(
//       currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     );
//     currentTime.setMinutes(currentTime.getMinutes() + 30); // Increment by 30 minutes
//   }

//   return timeSlots;
// }

function generateTimeSlots(startTime, endTime) {
  const timeSlots = [];
  let [startHours, startMinutes] = startTime.split(":").map(Number);
  let [endHours, endMinutes] = endTime.split(":").map(Number);

  console.log(startHours, startMinutes, endHours, endMinutes);

  // Convert times to minutes since midnight
  let currentMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  console.log("======>", currentMinutes, endTotalMinutes);

  // Generate time slots in 30-minute intervals
  while (currentMinutes < endTotalMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeSlot = new Date(2024, 0, 1, hours, minutes).toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit", hour12: true }
    );

    timeSlots.push(timeSlot);
    currentMinutes += 30;
  }

  //    while (currentMinutes && endTotalMinutes) {
  //     const hours = Math.floor(currentMinutes / 60);
  //     const minutes = currentMinutes % 60;
  //     const timeSlot = new Date(2024, 0, 1, hours, minutes).toLocaleTimeString(
  //       [],
  //       { hour: "2-digit", minute: "2-digit", hour12: true }
  //     );

  //     timeSlots.push(timeSlot);
  //     currentMinutes += 30;
  //   }

  return timeSlots;
}

// // Example usage
// const startTime = '01:00';
// const endTime = '19:00';
// console.log(generateTimeSlots(startTime, endTime));

const createDoctorDetails = async (req, res) => {
  try {
    const userId = req.body.doctorId;
    // const role = req.userRole;
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

    if (user?.role !== "doctor")
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );

    const {
      specialist,
      experience,
      clinicAddress,
      about,
      doctorId,
      clinicPrice,
      onlineConsultationPrice,
      emergencyPrice,
      schedule,
    } = req.body;

    if (!specialist) {
      return res.status(400).json(
        Response({
          message: "Specialist is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!experience) {
      return res.status(400).json(
        Response({
          message: "Experience is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!clinicAddress) {
      return res.status(400).json(
        Response({
          message: "Clinic Address is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!about) {
      return res.status(400).json(
        Response({
          message: "About is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!doctorId) {
      return res.status(400).json(
        Response({
          message: "doctorId is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!clinicPrice) {
      return res.status(400).json(
        Response({
          message: "Clinic Price is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!onlineConsultationPrice) {
      return res.status(400).json(
        Response({
          message: "Online Consultation Price is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    if (!emergencyPrice) {
      return res.status(400).json(
        Response({
          message: "Emergency Price is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }
    if (!schedule) {
      return res.status(400).json(
        Response({
          message: "Schedule is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    const packages = [];
    packages.push({
      packageName: "clinicPrice",
      packagePrice: clinicPrice,
    });

    packages.push({
      packageName: "onlineConsultationPrice",
      packagePrice: onlineConsultationPrice,
    });

    packages.push({
      packageName: "emergencyPrice",
      packagePrice: emergencyPrice,
    });

    const doctorDetails = await DoctorDetailsModel.create({
      specialist,
      experience,
      clinicAddress,
      about,
      doctorId,
      clinicPrice,
      onlineConsultationPrice,
      emergencyPrice,
      schedule,
      packages,
    });

    res.status(200).json(
      Response({
        message: "Doctor Details created successfully",
        data: doctorDetails,
        status: "OK",
        statusCode: 200,
      })
    );
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

// const getDoctor = async (req, res) => {
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

//     if (user.role !== "user") {
//       return res.status(403).json(
//         Response({
//           message: "You are not authorized to perform this action",
//           status: "Failed",
//           statusCode: 403,
//         })
//       );
//     }
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     // Get today's date in UTC format
//     const daysOfWeek = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];
//     const today = new Date().getDay(); // Returns index of the day (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
//     const dayName = daysOfWeek[today];
//     console.log("Today's date:", dayName);
//     const specialist = req.query.specialist;
//     const search = req.query.search;
//     // if (!specialist) {
//     //   return res.status(400).json(
//     //     Response({
//     //       message: "Specialist is required",
//     //       status: "Failed",
//     //       statusCode: 400,
//     //     })
//     //   );
//     // }

//     let filter = {};
//     if (specialist) {
//       filter["specialist"] = specialist;
     
//     }
//     console.log(filter);
//     const doctorDetails = await DoctorDetailsModel.find(filter)
//       .populate([
//         {
//           path: "doctorId",
//           match: { isEmergency: false },
//         },
//       ])
//       .lean();

//       console.log("aiman====================>", doctorDetails);
      

//     // const details = await DoctorDetailsModel.find().populate("doctorId").lean();
//     // console.log("=======>",details);
//     console.log("aiman====================>", doctorDetails);

//     // Filter based on search query
//     // const filteredDoctors = doctorDetails.filter((doctor) => {
//     //   const { firstName, lastName, email,isEmergency } = doctor?.doctorId;
//     //   const searchLower = search ? search.toLowerCase() : "";
//     //    return (
//     //    !isEmergency && doctor?.specialist.toLowerCase().includes(searchLower) ||
//     //     doctor?.clinicAddress.toLowerCase().includes(searchLower) ||
//     //     doctor?.about.toLowerCase().includes(searchLower) ||
//     //     firstName?.toLowerCase().includes(searchLower) ||
//     //     lastName?.toLowerCase().includes(searchLower) ||
//     //     email?.toLowerCase().includes(searchLower)
//     //   );
//     // });


//     const filteredDoctors = doctorDetails.filter((doctor) => {
//       const searchLower = search ? search.toLowerCase() : "";
    
//       // Check if doctorId exists and is not null
//       if (!doctor?.doctorId) {
//         return false; // Skip this doctor as it doesn't have a valid doctorId
//       }
    
//       const { firstName, lastName, email, isEmergency } = doctor.doctorId;
    
//       return (
//         !isEmergency && 
//         (doctor?.specialist.toLowerCase().includes(searchLower) ||
//           doctor?.clinicAddress.toLowerCase().includes(searchLower) ||
//           doctor?.about.toLowerCase().includes(searchLower) ||
//           firstName?.toLowerCase().includes(searchLower) ||
//           lastName?.toLowerCase().includes(searchLower) ||
//           email?.toLowerCase().includes(searchLower))
//       );
//     });

//     // Filter schedule to get only today's schedule
//     filteredDoctors.forEach((doctor) => {
//       doctor.schedule = doctor.schedule.filter(
//         (slot) => slot.day.toLowerCase() === dayName.toLowerCase()
//       );
//     });

//     // Extract today's schedule and generate time slots if needed
//     filteredDoctors.forEach((doctor) => {
//       if (doctor.schedule.length > 0) {
//         const todaySchedule = doctor.schedule[0];
//         const startTime = todaySchedule.startTime;
//         const endTime = todaySchedule.endTime;
//         const timeSlots = generateTimeSlots(startTime, endTime);
//         doctor.timeSlots = timeSlots;
//       } else {
//         doctor.timeSlots = []; // No schedule found for today
//       }
//     });
//     if (filteredDoctors.length === 0) {
//       return res.status(404).json(
//         Response({
//           message: "Doctor not found",
//           status: "Failed",
//           statusCode: 404,
//         })
//       );
//     }


//     console.log("aiman==============================>", filteredDoctors);



//     res.status(200).json(
//       Response({
//         message: "Doctor Details fetched successfully",
//         data: filteredDoctors,
//         status: "OK",
//         statusCode: 200,
//         pagination: {
//           totalPages: Math.ceil(filteredDoctors.length / limit),
//           currentPage: page,
//           prevPage: page > 1 ? page - 1 : null,
//           nextPage:
//             page < Math.ceil(filteredDoctors.length / limit) ? page + 1 : null,
//           totalUsers: filteredDoctors.length,
//         },
        
//       })
//     );
//   } catch (error) {
//     res.status(500).json(
//       Response({
//         message: `Internal server error ${error.message}`,
//         status: "Failed",
//         statusCode: 500,
//       })
//     );
//   }
// };




const getDoctor = async (req, res) => {
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

    // Get today's date in UTC format
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay(); // Returns index of the day (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
    const dayName = daysOfWeek[today];
    console.log("Today's date:", dayName);

    const specialist = req.query.specialist;
    const search = req.query.search;

    let filter = {};
    if (specialist) {
      filter["specialist"] = specialist;
    }
    console.log(filter);

    const doctorDetails = await DoctorDetailsModel.find(filter)
      .populate([
        {
          path: "doctorId",
          match: { isEmergency: false },
        },
      ])
      .lean();

    console.log("Doctor Details:", doctorDetails);

    const filteredDoctors = doctorDetails.filter((doctor) => {
      const searchLower = search ? search.toLowerCase() : "";

      // Check if doctorId exists and is not null
      if (!doctor?.doctorId) {
        return false; // Skip this doctor as it doesn't have a valid doctorId
      }

      const { firstName, lastName, email, isEmergency } = doctor.doctorId;

      return (
        !isEmergency &&
        (doctor?.specialist?.toLowerCase().includes(searchLower) ||
          doctor?.clinicAddress?.toLowerCase().includes(searchLower) ||
          doctor?.about?.toLowerCase().includes(searchLower) ||
          firstName?.toLowerCase().includes(searchLower) ||
          lastName?.toLowerCase().includes(searchLower) ||
          email?.toLowerCase().includes(searchLower))
      );
    });

    // Filter schedule to get only today's schedule
    filteredDoctors.forEach((doctor) => {
      if (doctor.schedule) {
        doctor.schedule = doctor.schedule.filter(
          (slot) => slot.day.toLowerCase() === dayName.toLowerCase()
        );
      } else {
        doctor.schedule = [];
      }
    });

    // Extract today's schedule and generate time slots if needed
    filteredDoctors.forEach((doctor) => {
      if (doctor.schedule && doctor.schedule.length > 0) {
        const todaySchedule = doctor.schedule[0];
        const startTime = todaySchedule.startTime;
        const endTime = todaySchedule.endTime;

        // Check if startTime and endTime are defined
        if (startTime && endTime) {
          const timeSlots = generateTimeSlots(startTime, endTime);
          doctor.timeSlots = timeSlots;
        } else {
          doctor.timeSlots = []; // No valid startTime or endTime
        }
      } else {
        doctor.timeSlots = []; // No schedule found for today
      }
    });

    if (filteredDoctors.length === 0) {
      return res.status(404).json(
        Response({
          message: "Doctor not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    // Implement Pagination
    const totalDoctors = filteredDoctors.length;
    const totalPages = Math.ceil(totalDoctors / limit);

    // Adjust page if it exceeds total pages
    const currentPage = page > totalPages ? totalPages : page;

    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;

    const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);

    res.status(200).json(
      Response({
        message: "Doctor Details fetched successfully",
        data: paginatedDoctors,
        status: "OK",
        statusCode: 200,
        pagination: {
          totalPages: totalPages,
          currentPage: currentPage,
          prevPage: currentPage > 1 ? currentPage - 1 : null,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          totalDoctors: totalDoctors,
        },
      })
    );
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



const singleDoctor = async (req, res) => {
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

    if (user.role !== "user") {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      });
    }

    const { id, date, specialist, search } = req.query;

    // Get the search date or default to today, expecting date format YYYY-MM-DD
    const searchDate = date ? moment(date, "YYYY-MM-DD").toDate() : new Date();
    console.log("Search date:", searchDate.getUTCDay());
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = date
      ? daysOfWeek[searchDate.getUTCDay() + 1]
      : daysOfWeek[new Date().getUTCDay()];
    console.log("Today's date:", dayName);

    let filter = { doctorId: id };
    if (specialist) {
      filter.specialist = specialist;
    }

    const doctorDetails = await DoctorDetailsModel.find(filter)
      .populate("doctorId")
      .lean();

    // Filter based on search query
    const searchLower = search ? search.toLowerCase() : "";
    const filteredDoctors = doctorDetails.filter((doctor) => {
      const { firstName, lastName, email } = doctor.doctorId;
      return (
        !search ||
        doctor.specialist.toLowerCase().includes(searchLower) ||
        doctor.clinicAddress.toLowerCase().includes(searchLower) ||
        doctor.about.toLowerCase().includes(searchLower) ||
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower)
      );
    });

    const doctorReview = await ReviewModel.find({ doctorId: id })
      .sort({ createdAt: -1 })
      .populate({
        path: "patientId",
        select: "firstName lastName email image",
      })
      // .select("comment rating patientId")
      .lean();

    const averageRating = calculateAverageRating(doctorReview);
    console.log("averageRating=====================>", averageRating);
    // console.log("doctorReview",doctorReview);
    const doctor = await User.findById(id);
    console.log("doctor", doctor);

    if (!doctor) {
      return res.status(404).json(
        Response({
          message: "Doctor not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    if (doctor?.role !== "doctor") {
      return res.status(404).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }
    doctor.rating = averageRating;
    doctor.reviewCount = doctorReview.length;
    console.log("doctor", doctor);
    await doctor.save();

    // Filter schedule to get only the schedule for the specified day
    filteredDoctors.forEach((doctor) => {
      filteredDoctors[0].allSchedule = doctor?.schedule;
      filteredDoctors[0].topReviews = doctorReview.slice(0, 3);

      doctor.schedule = doctor.schedule.filter(
        (slot) => slot.day.toLowerCase() === dayName.toLowerCase()
      );
      console.log("doctor.schedule==============>", doctor.schedule);
      if (doctor.schedule.length > 0) {
        console.log("doctor.schedule==============>", doctor.schedule);

        const todaySchedule = doctor.schedule[0];
        const startTime = todaySchedule.startTime;
        const endTime = todaySchedule.endTime;
        console.log("startTime", startTime, "endTime", endTime);
        doctor.timeSlots = generateTimeSlots(startTime, endTime);
        console.log("aim", generateTimeSlots(startTime, endTime));
      } else {
        doctor.timeSlots = []; // No schedule found for the specified day
      }
    });

    res.status(200).json(
      Response({
        message: "Doctor Details fetched successfully",
        data: filteredDoctors[0],
        status: "OK",
        statusCode: 200,
      })
    );
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

const sendPrescription = async (req, res) => {
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

    if (user.role !== "doctor") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }
    const { patientId,patientDetailsId } = req.body;
    console.log("patientId", patientId);
    const file = req.file;

    if (!file) {
      return res.status(400).json(
        Response({
          statusCode: 400,
          message: "File not found",
          status: "Failed",
        })
      );
    }

    console.log("file==============>",req.file);
    console.log("patientId==============>", patientId);

    let filePrescription = {};
    if (req.file) {
      filePrescription = {
        publicFileURL: `images/users/${req.file.filename}`,
        path: `public/images/users/${req.file.filename}`,
      };
    }

    const prescription = new DoctorPrescriptionModel({
      doctorId: userId,
      patientId,
      file: filePrescription,
      patientDetailsId
    });

    await prescription.save();
    if (!prescription) {
      return res.status(400).json(
        Response({
          statusCode: 400,
          message: "Prescription not found",
          status: "Failed",
        })
      );
    }

    const notification = NotificationModel.create(
      {
        message: `${user?.firstName} ${user?.lastName} sent a prescription.`,
        role: "user",
        recipientId: patientId,
      }
    )

    io.emit(`notification::${patientId}`, notification);


    res.status(200).json(
      Response({
        data: prescription,
        message: "Prescription sent successfully",
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log("error-send-prescription", error?.message);
    res
      .status(500)
      .json(
        Response({ message: error?.message, status: "Failed", statusCode: 500 })
      );
  }
};

const getDoctorDetails = async (req, res) => {
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
    if (user.role !== "doctor") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const doctor = await DoctorDetailsModel.findOne({
      doctorId: userId,
    }).populate("doctorId");

    if (!doctor) {
      return res.status(400).json(
        Response({
          statusCode: 400,
          message: "Doctor not found",
          status: "Failed",
        })
      );
    }
    res.status(200).json(
      Response({
        data: doctor,
        message: "Doctor Details fetched successfully",
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log("get-login-doctor-details", error?.message);
    res
      .status(500)
      .json(
        Response({ message: error?.message, status: "Failed", statusCode: 500 })
      );
  }
};

const editDoctorDetails = async (req, res) => {
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

    if (user.role !== "doctor") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const {
      specialist,
      experience,
      clinicAddress,
      about,
      doctorId,
      clinicPrice,
      onlineConsultationPrice,
      emergencyPrice,
      schedule,
    } = req.body;

    // Find the existing doctor details
    let doctorDetails = await DoctorDetailsModel.findOne({ doctorId });

    if (!doctorDetails) {
      return res.status(404).json(
        Response({
          message: "Doctor details not found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    // Update the doctor details
    doctorDetails.specialist = specialist || doctorDetails.specialist;
    doctorDetails.experience = experience || doctorDetails.experience;
    doctorDetails.clinicAddress = clinicAddress || doctorDetails.clinicAddress;
    doctorDetails.about = about || doctorDetails.about;
    doctorDetails.schedule = schedule || doctorDetails.schedule;

    // Update the packages
    doctorDetails.packages = [
      {
        packageName: "clinicPrice",
        packagePrice: clinicPrice,
      },
      {
        packageName: "onlineConsultationPrice",
        packagePrice: onlineConsultationPrice,
      },
      {
        packageName: "emergencyPrice",
        packagePrice: emergencyPrice,
      },
    ];

    // Save the updated doctor details
    await doctorDetails.save();

    res.status(200).json(
      Response({
        message: "Doctor details updated successfully",
        data: doctorDetails,
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(
      Response({
        message: `Internal server error: ${error.message}`,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const doctorEarnings = async (req, res) => {
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

    if (user.role !== "doctor") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const doctorEarnings = await doctorEarningModel.find({ doctorId: userId });

    // Calculate total earnings
    const totalEarn = doctorEarnings.reduce(
      (acc, earning) => acc + earning.price,
      0
    );

    // Get current month and year
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter earnings for the current month
    const earnThisMonth = doctorEarnings
      .filter((earning) => {
        const earningDate = new Date(earning.createdAt);
        return (
          earningDate.getMonth() === currentMonth &&
          earningDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, earning) => acc + earning.price, 0);

    const withdrawAmounts = await withdrawalModel.find({
      doctorId: userId,
      status: "Pending" || "Completed",
    });

    let totalWithdraw = withdrawAmounts.reduce(
      (acc, earning) => acc + earning?.withdrawAmount,
      0
    );

    console.log("withdrawAmount", totalWithdraw);

    let requiredAmount = totalEarn - totalWithdraw;

    console.log("requiredAmount", requiredAmount);

    user.earningAmount = requiredAmount;

    await user.save();

    res.status(200).json(
      Response({
        data: {
          earnThisMonth,
          totalEarn,
          requiredAmount,
        },
        message: "Doctor Earnings fetched successfully",
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log("doctor-earnings", error?.message);
    res.status(500).json(
      Response({
        message: error?.message,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const withdrawalRequest = async (req, res) => {
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

    if (user.role !== "doctor") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const { bankName, accountType, accountNumber, withdrawAmount } = req.body;

    if (!bankName || !accountType || !accountNumber || !withdrawAmount) {
      return res.status(400).json(
        Response({
          message: "All fields are required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    // Check if withdrawAmount is less than or equal to total earnings
    if (withdrawAmount > user?.earningAmount) {
      return res.status(400).json(
        Response({
          message: "Withdrawal amount exceeds total earnings",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    // Create a new withdrawal request
    const withdrawal = new withdrawalModel({
      doctorId: userId,
      bankName,
      accountType,
      accountNumber,
      withdrawAmount: withdrawAmount,
      status: "Pending",
    });

    await withdrawal.save();

    // Subtract withdrawAmount from total earnings
    user.earningAmount -= withdrawAmount;
    await user.save();

    // Create a new withdrawal request
    // await withdrawal.save();

    const notification = NotificationModel.create({
      message: `Withdrawal request created by ${user?.firstName} ${user?.lastName}`,
      role: "admin",
      recipientId: userId,
    })

    // Emit notification

    io.emit(`notification::${userId}`, notification);


    // Respond with success
    res.status(200).json(
      Response({
        message: "Withdrawal request created successfully",
        data: withdrawal,
        status: "OK",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log("withdrawal-request", error?.message);
    res.status(500).json(
      Response({
        message: error?.message,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const lastWithDrawList = async (req, res) => {
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

    if (user.role !== "doctor") {
      return res.status(403).json(
        Response({
          message: "You are not authorized to perform this action",
          status: "Failed",
          statusCode: 403,
        })
      );
    }

    const page = req.query.page;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const totalWithdraws = await withdrawalModel.countDocuments({
      doctorId: userId,
    });

    const withdrawals = await withdrawalModel
      .find({ doctorId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    if (!withdrawals) {
      return res.status(404).json(
        Response({
          message: "No withdrawals found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    res.status(200).json(
      Response({
        data: withdrawals,
        message: "Withdrawals fetched successfully",
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
    console.log("last-withdraw-list", error?.message);
    res.status(500).json(
      Response({
        message: error?.message,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const getLogInUserReview = async (req, res) => {
  try {
    const doctorId = req.userId;
    const user = await User.findById(doctorId);
    if (!user) {
      return res.status(404).json(
        Response({
          message: "User not found",
          status: "Failed",
          statusCode: 404,
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

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const totalItems = await ReviewModel.countDocuments({ doctorId: doctorId });

    const reviews = await ReviewModel.find({ doctorId: doctorId })
      .populate("patientId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const response = {
      avgRating: user?.rating,
      reviews: reviews,
      reviewsCount: user?.reviewCount,
    };
    if (!reviews) {
      return res.status(404).json(
        Response({
          message: "No reviews found",
          status: "Failed",
          statusCode: 404,
        })
      );
    }

    res.status(200).json(
      Response({
        data: response,
        message: "Reviews fetched successfully",
        status: "OK",
        statusCode: 200,
        pagination: {
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalItems / limit) ? page + 1 : null,
          totalUsers: totalItems,
        },
      })
    );
  } catch (error) {
    res.status(500).json(
      Response({
        message: error?.message,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const emergencyConsultation = async (req, res) => {
  try {
    const doctorId = req.userId;
    const user = await User.findById(doctorId);
    if (!user) {
      return res.status(404).json(
        Response({
          message: "User not found",
          status: "Failed",
          statusCode: 404,
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
    const { isEmergency } = req.body;

    if (!isEmergency) {
      return res.status(400).json(
        Response({
          message: "Emergency status is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }
    console.log("================>",isEmergency);


      
      if(isEmergency==="true"){
        user.isEmergency = isEmergency;
        await user.save();

    
        res.status(200).json(
          Response({
            data: user,
            message: "Emergency status enable successfully",
            status: "OK",
            statusCode: 200,
          })
        );

      }else{
        user.isEmergency = isEmergency;
        await user.save();
    
        res.status(200).json(
          Response({
            data: user,
            message: "Emergency status disable successfully",
            status: "OK",
            statusCode: 200,
          })
        );
      }

   
  } catch (error) {
    console.log("emergency-consultation", error?.message);
    res.status(500).json(
      Response({
        message: error?.message,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
};

const loginDoctorStatus = async (req, res) => {
  try {
    const doctorId = req.userId;
    const user = await User.findById(doctorId);
    if (!user) {
      return res.status(404).json(
        Response({
          message: "User not found",
          status: "Failed",
          statusCode: 404,
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

      // Count total appointments for the doctor
      const totalAppointments = await PaymentModel.countDocuments({ doctorId });

      // Count active appointments for the doctor
      const activeAppointments = await PaymentModel.countDocuments({ doctorId, status: "active" });
  
      // Count completed appointments for the doctor
      const completedAppointments = await PaymentModel.countDocuments({ doctorId, status: "completed" });

    res.status(200).json(
      Response({
        data: {
          totalAppointments,
          activeAppointments,
          completedAppointments
        },
        message: "Login status fetched successfully",
        status: "OK",
        statusCode: 200,
      })
    )

  } catch (error) {
    console.log("doctor-status", error?.message);
    res.status(500).json(
      Response({
        message: error?.message,
        status: "Failed",
        statusCode: 500,
      })
    );
  }
}


const completedAppointments = async (req, res) => {
  try {
    const doctorId = req.userId;
    const user = await User.findById(doctorId);

    if (!user) {
      return res.status(404).json(Response({
        message: "User not found",
        status: "Failed",
        statusCode: 404,
      }));
    }

    if (user.role !== "doctor") {
      return res.status(403).json(Response({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      }));
    }

    const { id } = req.body;

    const completedAppointment = await PaymentModel.findByIdAndUpdate(
      id,
      { isCompleted: true, status: "completed" },
      { new: true }
    );

    

    if (!completedAppointment) {
      return res.status(404).json(Response({
        message: "Appointment not found",
        status: "Failed",
        statusCode: 404,
      }));
    }

    const notification = new NotificationModel({
      message: `Doctor ${user.firstName } ${user.lastName} has completed an appointment with you.`,
      role: "user",
      recipientId:completedAppointment?.patientId,
    });

    io.emit(`notification::${completedAppointment?.patientId}`, notification);


    res.status(200).json(Response({
      data: completedAppointment,
      message: "Appointment completed successfully",
      status: "OK",
      statusCode: 200,
    }));
  } catch (error) {
    console.log("doctor-status", error.message);
    res.status(500).json(Response({
      message: error.message,
      status: "Failed",
      statusCode: 500,
    }));
  }
};





module.exports = {
  createDoctorDetails,
  getLogInUserReview,
  getDoctor,
  lastWithDrawList,
  singleDoctor,
  sendPrescription,
  getDoctorDetails,
  editDoctorDetails,
  doctorEarnings,
  withdrawalRequest,
  emergencyConsultation,
  loginDoctorStatus,
  completedAppointments
};
