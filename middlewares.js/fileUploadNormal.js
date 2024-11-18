const multer = require("multer");
const path = require("path");
const createError = require("http-errors");


const UPLOAD_DIR = process.env.UPLOAD_FOLDER || "public/images/users";
// const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5242880; // 5 MB
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 20971520; // 20 MB


const ALLOWED_FILE_TYPES = [
  "jpg", "jpeg", "png", "xlsx", "csv", "pdf", "doc", "docx",
  "mp3", "wav", "ogg", "mp4", "avi", "mov", "mkv", "webm","svg"
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    console.log("rrrrrrrrrr========>",file);
    
    const extName = path.extname(file.originalname);
    console.log("ahadHossainAiman=====>",extName)
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(extName, "") + extName
    );
  },
});

const fileFilter = (req, file, cb) => {
  console.log("========================?",file);
  
  const extName = path.extname(file.originalname).toLowerCase(); 
  console.log("ahad=====>",extName);
  // Convert to lower case for case-insensitive comparison
  const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName.substring(1));

  if (!isAllowedFileType) {
    return cb(createError(new Error("File type not supported")));
  }
  cb(null, true);
};

const uploadNormal = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
  fileFilter: fileFilter,
});

module.exports = {uploadNormal};