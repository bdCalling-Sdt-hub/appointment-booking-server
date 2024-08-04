const privacyPolicy = require("../../models/privacyPolicy.model");
const TermsCondition = require("../../models/termsAndServices.model");
const AboutUs = require("../../models/aboutUs.model");
const User = require("../../models/User");
const Response = require("../../helpers/response");



const addPrivacyPolicy = async (req, res) => {
    try {
        const adminId = req?.userId;
        const admin = await User.findById(adminId);

        if (!admin || !admin.role === "admin") {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized",
                statusCode: 401,
                type: "Settings"
            });
        }

        let privacy = await privacyPolicy.findOne({});

        if (!privacy) {
            // If privacy policy doesn't exist, create it
            privacy = new privacyPolicy();
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json(Response({ message: "Content is required" }));
        }

        privacy.content = content;
        await privacy.save();

        res.status(201).json(Response({
            message: "Privacy Policy saved successfully",
            data: privacy,
            statusCode: 201,
            type: "Settings"
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response({ message: `Internal server error ${error}`, data: error }));
    }
}


const getPrivacyPolicy = async (req, res) => {
    try {
         const privacy = await privacyPolicy.findOne({});
         if (!privacy) {
              return res.status(404).json(Response({message: "Privacy policy not found", statusCode: 404}));	
         }
         res.status(200).json(Response({message:"data get successfully",data:privacy ,statusCode: 200}));
         
    } catch (error) {
         res.status(500).json(Response({message: "Internal server error", statusCode: 500}));
    }
}



const addTermsCondition = async (req, res) => {
    try {
        const adminId = req?.userId;
        const admin = await User.findById(adminId);

        if (!admin || !admin.role === "admin") {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized",
                statusCode: 401,
                type: "Settings"
            });
        }

        let termsCondition = await TermsCondition.findOne({});

        if (!termsCondition) {
            // If terms and conditions don't exist, create them
            termsCondition = new TermsCondition();
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json(Response({ message: "Content is required" }));
        }

        termsCondition.content = content;
        await termsCondition.save();

        res.status(201).json(Response({
            message: "Terms and conditions saved successfully",
            data: termsCondition,
            statusCode: 201,
            type: "Settings"
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response({ message: "Internal server error", data: error }));
    }
}


const getTermsCondition = async (req, res) => {
    try {
         // const userId = req.body.userId;
         // const admin = await User.findById(userId);
         // if(!admin.isAdmin){
         //      return res.status(401).json({
         //           status: "error",
         //           message: "You are not authorized",
         //           statusCode: 401,
         //           type: "Settings"
         //      });
         // }
         const terms = await TermsCondition.findOne({});
         if(!terms){
              return res.status(404).json(Response({message: "Terms condition not found",statusCode:404}));
         }
         res.status(200).json(Response({message:"data get successfully",data:terms,statusCode:200,type:"Settings"}));
    } catch (error) {
         res.status(500).json(Response({message: "Internal server error",statusCode:500}));
    }
}

const addAboutUs = async (req, res) => {
    try {
        const adminId = req?.userId;
        const admin = await User.findById(adminId);

        if (!admin || !admin.role === "admin") {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized",
                statusCode: 401,
                type: "Settings"
            });
        }

        let about = await AboutUs.findOne();

        if (!about) {
            // If About Us content doesn't exist, create it
            about = new AboutUs();
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json(Response({ message: "Content is required" }));
        }

        about.content = content;
        await about.save();

        res.status(201).json(Response({
            message: "About Us content saved successfully",
            data: about,
            statusCode: 201,
            type: "Settings"
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response({ message: "Internal server error", data: error }));
    }
}


const getAboutUs = async (req, res) => {
    try {
         // const userId = req.body.userId;
         // const admin = await User.findById(userId);
         // if(!admin.isAdmin){
         //      return res.status(401).json({
         //           status: "error",
         //           message: "You are not authorized",
         //           statusCode: 401,
         //           type: "Settings"
         //      });
         // }
         const about = await AboutUs.findOne({});
         if(!about){
              return res.status(404).json(Response({message: "About us not found",}));
         }
         res.status(200).json(Response({message:"data get successfully",data:about,statusCode:200,type:"Settings"}));
    } catch (error) {
         res?.status(500).json(Response({message: "Internal server error"}));
    }
}

module.exports = { addPrivacyPolicy,getPrivacyPolicy,addTermsCondition,getTermsCondition,addAboutUs,getAboutUs };