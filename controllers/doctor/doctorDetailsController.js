const Response = require("../../helpers/response");
const DoctorDetailsModel = require("../../models/DoctorDetails.model");
const ReviewModel = require("../../models/Review.model");
const User = require("../../models/User");
const moment = require("moment");


function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  return averageRating;
}



// Function to generate time slots array between startTime and endTime
function generateTimeSlots(startTime, endTime) {
  const timeSlots = [];
  let currentTime = new Date(`2024-01-01T${startTime}`);
  const endTimeObj = new Date(`2024-01-01T${endTime}`);

  while (currentTime <= endTimeObj) {
    timeSlots.push(
      currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    currentTime.setMinutes(currentTime.getMinutes() + 30); // Increment by 30 minutes
  }

  return timeSlots;
}

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
    if (!specialist) {
      return res.status(400).json(
        Response({
          message: "Specialist is required",
          status: "Failed",
          statusCode: 400,
        })
      );
    }

    let filter = {};
    if (specialist) {
      filter["specialist"] = specialist;
    }
    console.log(filter);
    const doctorDetails = await DoctorDetailsModel.find(filter)
      .populate("doctorId")
      .lean();

    // const details = await DoctorDetailsModel.find().populate("doctorId").lean();
    // console.log("=======>",details);
    console.log("aiman====================>",doctorDetails);

    // Filter based on search query
    const filteredDoctors = doctorDetails.filter((doctor) => {
      const { firstName, lastName, email } = doctor?.doctorId;
      const searchLower = search ? search.toLowerCase() : "";
      return (
        doctor?.specialist.toLowerCase().includes(searchLower) ||
        doctor?.clinicAddress.toLowerCase().includes(searchLower) ||
        doctor?.about.toLowerCase().includes(searchLower) ||
        firstName?.toLowerCase().includes(searchLower) ||
        lastName?.toLowerCase().includes(searchLower) ||
        email?.toLowerCase().includes(searchLower)
      );
    });

    // Filter schedule to get only today's schedule
    filteredDoctors.forEach((doctor) => {
      doctor.schedule = doctor.schedule.filter(
        (slot) => slot.day.toLowerCase() === dayName.toLowerCase()
      );
    });

    // Extract today's schedule and generate time slots if needed
    filteredDoctors.forEach((doctor) => {
      if (doctor.schedule.length > 0) {
        const todaySchedule = doctor.schedule[0];
        const startTime = todaySchedule.startTime;
        const endTime = todaySchedule.endTime;
        const timeSlots = generateTimeSlots(startTime, endTime);
        doctor.timeSlots = timeSlots;
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
   

    res.status(200).json(
      Response({
        message: "Doctor Details fetched successfully",
        data: filteredDoctors,
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



const singleDoctor = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(Response({ message: "User not found", status: "Failed", statusCode: 404 }));
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

    const doctorReview =  await ReviewModel.find({doctorId:id}).sort({createdAt:-1}).populate({
      path: "patientId",
      select: "firstName lastName email image",
    }).select("comment rating patientId").lean();

    const averageRating = calculateAverageRating(doctorReview);
    console.log("averageRating=====================>",averageRating); 
    // console.log("doctorReview",doctorReview);
    const doctor = await User.findById(id)
    console.log("doctor",doctor);

    if (!doctor) {
      return res.status(404).json(Response({
        message: "Doctor not found",
        status: "Failed",
        statusCode: 404,
      }));
    }

    if (doctor?.role !== "doctor") {
      return res.status(404).json(Response({
        message: "You are not authorized to perform this action",
        status: "Failed",
        statusCode: 403,
      }));
    }
    doctor.rating = averageRating;
    doctor.reviewCount = doctorReview.length;
    console.log("doctor",doctor);
    await doctor.save();



    

    // Filter schedule to get only the schedule for the specified day
    filteredDoctors.forEach((doctor) => {
      filteredDoctors[0].allSchedule = doctor?.schedule;   
      filteredDoctors[0].topReviews = doctorReview.slice(0, 3);
    
      doctor.schedule = doctor.schedule.filter(
        (slot) => slot.day.toLowerCase() === dayName.toLowerCase()
      );
      if (doctor.schedule.length > 0) {
       
        const todaySchedule = doctor.schedule[0];
        const startTime = todaySchedule.startTime;
        const endTime = todaySchedule.endTime;
        doctor.timeSlots = generateTimeSlots(startTime, endTime);
      } else {
        doctor.timeSlots = []; // No schedule found for the specified day
      }
    });

   

    res.status(200).json(Response({
      message: "Doctor Details fetched successfully",
      data: filteredDoctors[0],
      status: "OK",
      statusCode: 200,
    }));
  } catch (error) {
    res.status(500).json(Response({
      message: `Internal server error ${error.message}`,
      status: "Failed",
      statusCode: 500,
    }));
  }
};





module.exports = { createDoctorDetails, getDoctor, singleDoctor };
