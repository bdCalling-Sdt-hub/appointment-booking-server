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
            const appointments = await PaymentModel.find({ date: { $gte: currentDate } })
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
            const currentDateString = currentDate.toISOString().split('T')[0];
            const currentTimeString = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            console.log(currentDateString, currentTimeString);
            const appointments = await PaymentModel.find({
                date: new Date(currentDateString),
                timeSlot: { $gte: currentTimeString }
            }).populate("patientDetailsId doctorId patientId");
            
            if (!appointments || appointments.length === 0) {
                return res.status(404).json({
                    statusCode: 404, 
                    message: 'Appointments not found', 
                    status: "Failed"
                });
            }
            for (let appointment of appointments) {
                appointment.status = "active";
                // await appointment.save(); 
                await PaymentModel.updateOne({ _id: appointment._id }, { $set: { status: "active" } });
                console.log("=================>>>>>",appointment?.status);// Await the save operation to handle async properly
            }

           
    
            res.status(200).json(Response({
                data: appointments, 
                status: "OK", 
                statusCode: 200
            }  
            ));
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: `Internal server error ${error.message}`,
                status: "Failed",
                statusCode: 500,
            });
        }
    }else if(status==="completed"){
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
            const appointments = await PaymentModel.find({ date: { $gte: currentDate } })
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
    }else{
        res.status(404).json({message: "Invalid status", status: "Failed", statusCode: 404});
    }
    } catch (error) {
        console.log(error?.message);
        res.status(500).json({message: error.message, status: "Failed", statusCode: 500});
    }
};










module.exports = { getAppointment };




