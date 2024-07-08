const Response = require("../../helpers/response");
const DoctorDetailsModel = require("../../models/DoctorDetails.model");
const User = require("../../models/User");

// Function to generate time slots array between startTime and endTime
function generateTimeSlots(startTime, endTime) {
    const timeSlots = [];
    let currentTime = new Date(`2024-01-01T${startTime}`);
    const endTimeObj = new Date(`2024-01-01T${endTime}`);
    
    while (currentTime <= endTimeObj) {
        timeSlots.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        currentTime.setMinutes(currentTime.getMinutes() + 30); // Increment by 30 minutes
    }
    
    return timeSlots;
}

const createDoctorDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;

        if (role !== "doctor")
            return res
                .status(403)
                .json(Response({ message: "You are not authorized to perform this action", status: "Failed", statusCode: 403 }));

        const user = await User.findById(userId);

        if (!user) {
            return res
                .status(404)
                .json(Response({ message: "User not found", status: "Failed", statusCode: 404 }));
        }

        const { specialist, experience,clinicAddress,about,doctorId,clinicPrice,onlineConsultationPrice,emergencyPrice,schedule } = req.body;

        if (!specialist) {
            return res
                .status(400)
                .json(Response({ message: "Specialist is required", status: "Failed", statusCode: 400 }));
        }   

        if (!experience) {
            return res
                .status(400)
                .json(Response({ message: "Experience is required", status: "Failed", statusCode: 400 }));
        }

        if (!clinicAddress) {
            return res
                .status(400)
                .json(Response({ message: "Clinic Address is required", status: "Failed", statusCode: 400 }));
        }

        if (!about) {
            return res
                .status(400)
                .json(Response({ message: "About is required", status: "Failed", statusCode: 400 }));
        }

        if (!doctorId) {
            return res
                .status(400)
                .json(Response({ message: "doctorId is required", status: "Failed", statusCode: 400 }));
        }

        if (!clinicPrice) {
            return res
                .status(400)
                .json(Response({ message: "Clinic Price is required", status: "Failed", statusCode: 400 }));
        }

        if (!onlineConsultationPrice) {
            return res
                .status(400)
                .json(Response({ message: "Online Consultation Price is required", status: "Failed", statusCode: 400 }));
        }

        if (!emergencyPrice) {
            return res
                .status(400)   
                .json(Response({ message: "Emergency Price is required", status: "Failed", statusCode: 400 }));
        }
        if(!schedule){
            return res
                .status(400)
                .json(Response({ message: "Schedule is required", status: "Failed", statusCode: 400 }));
        }
        
        const doctorDetails = await DoctorDetailsModel.create(
            {
                specialist,
                experience,
                clinicAddress,
                about,
                doctorId,
                clinicPrice,
                onlineConsultationPrice,
                emergencyPrice,
                schedule
            }
        );

        res.status(200).json(Response({ message: "Doctor Details created successfully",data: doctorDetails, status: "OK", statusCode: 200 }));


    } catch (error) {
        res.status(500).json(Response({ message: `Internal server error ${error.message}`, status: "Failed", statusCode: 500 }));
    }
}

const getDoctor = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!user){
            return res
                .status(404)
                .json(Response({ message: "User not found", status: "Failed", statusCode: 404 }));
        }
        
        if (user.role !== "user"){
            return res
                .status(403)
                .json(Response({ message: "You are not authorized to perform this action", status: "Failed", statusCode: 403 }));
        }

           // Get today's date in UTC format
           const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
           const today = new Date().getDay(); // Returns index of the day (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
           const dayName = daysOfWeek[today];
           console.log("Today's date:", dayName);
           const specialist = req.query.specialist; 

           let filter = {};
        if (specialist) {
            filter["specialist"] = specialist;
        }

        const doctorDetails = await DoctorDetailsModel.find(filter).lean();

          // Filter schedule to get only today's schedule
     doctorDetails.forEach(doctor => {
            doctor.schedule = doctor.schedule.filter(slot => slot.day.toLowerCase() === dayName.toLowerCase());
        });

        console.log("Filtered doctorDetails:", doctorDetails);

      

       // Extract today's schedule and generate time slots if needed
        doctorDetails.forEach(doctor => {
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


        res.status(200).json(Response({ message: "Doctor Details fetched successfully",data: doctorDetails, status: "OK", statusCode: 200 }));
    } catch (error) {
        res.status(500).json(Response({ message: `Internal server error ${error.message}`, status: "Failed", statusCode: 500 }));
    }
}



module.exports = { createDoctorDetails,getDoctor }