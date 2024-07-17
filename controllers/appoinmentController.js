const Response = require("../helpers/response");
const PaymentModel = require("../models/Payment.model");

const User = require("../models/User");

const getAppointment = async (req, res) => {
    try {
        const {status} = req.query;
    if(status==="upcomming"){
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    statusCode: 404, 
                    message: 'User not found', 
                    status: "Failed"
                });
            }
            
            if(user.role !== "user"){
                return res.status(403).json({   
                    message: "You are not authorized to perform this action",
                    status: "Failed",
                    statusCode: 403,
                });
            }   
    
            const currentDate = new Date();
            const appointments = await PaymentModel.find({ date: { $gte: currentDate },patientId: user._id })
                .populate("patientDetailsId doctorId patientId");
            
            if (!appointments || appointments.length === 0) {
                return res.status(404).json({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                });
            }
    
            res.status(200).json({
                data: appointments, 
                status: "OK", 
                statusCode: 200
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            });
        }
    }else if(status==="active"){
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            // console.log("=======>",user);
            if (!user) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'User not found', 
                    status: "Failed"
                }));
            }
            
            if(user.role !== "user"){
                return res.status(403).json(Response({   
                    message: "You are not authorized to perform this action",
                    status: "Failed",
                    statusCode: 403,
                }));
            }   
    
            const currentDate = new Date();
            const currentDateString = currentDate.toISOString().split('T')[0];
            const currentTimeString = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            console.log(currentDateString, currentTimeString);
            const appointments = await PaymentModel.find({

                date: { $lte: new Date(currentDateString) },
                // timeSlot: { $lte: currentTimeString },
                patientId: user._id

            }).populate("patientDetailsId doctorId patientId");
            
            if (!appointments || appointments.length === 0) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                }));
            }
            for (let appointment of appointments) {
                appointment.status = "active";
                // await appointment.save(); 
                await PaymentModel.updateOne({ _id: appointment._id }, { $set: { status: "active" } });
                console.log("=================>>>>>",appointment?.status);// Await the save operation to handle async properly
            }

            const result = appointments.filter(appointment => appointment.status === "active");

            if(!result || result.length === 0){
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                }));
            }

           
    
            res.status(200).json(Response({
                data: result, 
                status: "OK", 
                statusCode: 200
            }  
            ));
    
        } catch (error) {
            console.error(error);
            res.status(500).json(Response({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            }));
        }
    }else if(status==="completed"){
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'User not found', 
                    status: "Failed"
                }));
            }
            
            if(user.role !== "user"){
                return res.status(403).json(Response({   
                    message: "You are not authorized to perform this action",
                    status: "Failed",
                    statusCode: 403,
                }));
            }   
    
            const currentDate = new Date();
            const appointments = await PaymentModel.find({ date: { $gte: currentDate } ,patientId: user._id })
                .populate("patientDetailsId doctorId patientId");
            



            if (!appointments || appointments.length === 0) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                }));
            }

            for (let appointment of appointments) {
                if(appointment.isCompleted){
                    // appointment.status = "completed";
                // await appointment.save(); 
                await PaymentModel.updateOne({ _id: appointment._id }, { $set: { status: "completed" } });
                console.log("=================>>>>>",appointment?.status);
                }
                // Await the save operation to handle async properly
            }
const result = appointments.filter(appointment => appointment.status === "completed");

    
            res.status(200).json(Response({
                data: result, 
                status: "OK", 
                statusCode: 200
            }));
    
        } catch (error) {
            console.error(error);
            res.status(500).json(Response({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            }));
        }
    }else{
        res.status(404).json(Response({message: "Invalid status", status: "Failed", statusCode: 404}));
    }
    } catch (error) {
        console.log(error?.message);
        res.status(500).json(Response({message: error.message, status: "Failed", statusCode: 500}));
    }
};

const getSingleAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(Response({ message: 'User not found', status: "Failed", statusCode: 404 }));
        }
        if(user?.role !== "user"){
            return res.status(404).json(Response({ message: "You are not authorized to perform this action", status: "Failed", statusCode: 403 }));
        }
        const appointmentId = req.params.appointmentId;
        console.log("appointmentId", appointmentId);
        const appointment = await PaymentModel.findById(appointmentId).populate("patientDetailsId doctorId patientId");
        if (!appointment) {
            return res.status(404).json(Response({ message: 'Appointment not found', status: "Failed", statusCode: 404 }));
        }
        res.status(200).json(Response({ data: appointment, status: "OK", statusCode: 200 }));
    } catch (error) {
        console.error(error?.message);
        res.status(500).json(Response({ message: `${error?.message}`, status: "Failed", statusCode: 500 }));
    }
};

const getAppointmentForDoctor = async (req, res) => {
    try {
        const {status} = req.query;
    if(status==="upcomming"){
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            console.log("userId", user);
            if (!user) {
                return res.status(404).json({
                    statusCode: 404, 
                    message: 'User not found', 
                    status: "Failed"
                });
            }
            
            if(user.role !== "doctor"){
                return res.status(403).json({   
                    message: "You are not authorized to perform this action",
                    status: "Failed",
                    statusCode: 403,
                });
            }   
    
            const currentDate = new Date();
            const appointments = await PaymentModel.find({ date: { $gte: currentDate },doctorId: user._id })
                .populate("patientDetailsId doctorId patientId");
            
            if (!appointments || appointments.length === 0) {
                return res.status(404).json({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                });
            }
    
            res.status(200).json({
                data: appointments, 
                status: "OK", 
                statusCode: 200
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            });
        }
    }else if(status==="active"){
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            // console.log("=======>",user);
            if (!user) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'User not found', 
                    status: "Failed"
                }));
            }
            
            if(user.role !== "doctor"){
                return res.status(403).json(Response({   
                    message: "You are not authorized to perform this action",
                    status: "Failed",
                    statusCode: 403,
                }));
            }   
    
            const currentDate = new Date();
            const currentDateString = currentDate.toISOString().split('T')[0];
            const currentTimeString = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            console.log(currentDateString, currentTimeString);
            const appointments = await PaymentModel.find({

                date: { $lte: new Date(currentDateString) },
                // timeSlot: { $lte: currentTimeString },
                doctorId: user._id

            }).populate("patientDetailsId doctorId patientId");
            
            if (!appointments || appointments.length === 0) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                }));
            }
            for (let appointment of appointments) {
                appointment.status = "active";
                // await appointment.save(); 
                await PaymentModel.updateOne({ _id: appointment._id }, { $set: { status: "active" } });
                console.log("=================>>>>>",appointment?.status);// Await the save operation to handle async properly
            }

            const result = appointments.filter(appointment => appointment.status === "active");

            if(!result || result.length === 0){
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                }));
            }

           
    
            res.status(200).json(Response({
                data: result, 
                status: "OK", 
                statusCode: 200
            }  
            ));
    
        } catch (error) {
            console.error(error);
            res.status(500).json(Response({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            }));
        }
    }else if(status==="completed"){
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'User not found', 
                    status: "Failed"
                }));
            }
            
            if(user.role !== "doctor"){
                return res.status(403).json(Response({   
                    message: "You are not authorized to perform this action",
                    status: "Failed",
                    statusCode: 403,
                }));
            }   
    
            const currentDate = new Date();
            const appointments = await PaymentModel.find({ date: { $gte: currentDate } ,doctorId: user._id })
                .populate("patientDetailsId doctorId patientId");
            



            if (!appointments || appointments.length === 0) {
                return res.status(404).json(Response({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                }));
            }

            for (let appointment of appointments) {
                if(appointment.isCompleted){
                    // appointment.status = "completed";
                // await appointment.save(); 
                await PaymentModel.updateOne({ _id: appointment._id }, { $set: { status: "completed" } });
                console.log("=================>>>>>",appointment?.status);
                }
                // Await the save operation to handle async properly
            }
const result = appointments.filter(appointment => appointment.status === "completed");

    
            res.status(200).json(Response({
                data: result, 
                status: "OK", 
                statusCode: 200
            }));
    
        } catch (error) {
            console.error(error);
            res.status(500).json(Response({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            }));
        }
    }else{
        res.status(404).json(Response({message: "Invalid status", status: "Failed", statusCode: 404}));
    }
    } catch (error) {
        console.log(error?.message);
        res.status(500).json(Response({message: error.message, status: "Failed", statusCode: 500}));
    }
};









module.exports = { getAppointment,getSingleAppointment,getAppointmentForDoctor };




