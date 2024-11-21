// const multer = require("multer");
// const path = require("path");
// const createError = require("http-errors");


// const UPLOAD_DIR = process.env.UPLOAD_FOLDER || "public/images/users";
// // const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5242880; // 5 MB
// const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 20971520; // 20 MB


// const ALLOWED_FILE_TYPES = [
//   "jpg", "jpeg", "png", "xlsx", "csv", "pdf", "doc", "docx",
//   "mp3", "wav", "ogg", "mp4", "avi", "mov", "mkv", "webm","svg"
// ];

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: function (req, file, cb) {
//     console.log("rrrrrrrrrr========>",file);
    
//     const extName = path.extname(file.originalname);
//     console.log("ahadHossainAiman=====>",extName)
//     cb(
//       null,
//       Date.now() + "-" + file.originalname.replace(extName, "") + extName
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   console.log("========================?",file);
  
//   const extName = path.extname(file.originalname).toLowerCase(); 
//   console.log("ahad=====>",extName);
//   // Convert to lower case for case-insensitive comparison
//   const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName.substring(1));

//   if (!isAllowedFileType) {
//     return cb(createError(new Error("File type not supported")));
//   }
//   cb(null, true);
// };

// const uploadNormal = multer({
//   storage: storage,
//   limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
//   fileFilter: fileFilter,
// });

// module.exports = {uploadNormal};


// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const createError = require("http-errors");

// // Ensure upload directory exists
// const UPLOAD_DIR = path.resolve(process.env.UPLOAD_FOLDER || "public/images/users");
// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

// const ALLOWED_FILE_TYPES = [
//   "jpg", "jpeg", "png", "xlsx", "csv", "pdf", "doc", "docx",
//   "mp3", "wav", "ogg", "mp4", "avi", "mov", "mkv", "webm", "svg"
// ];

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     const extName = path.extname(file.originalname);
//     const sanitizedName = file.originalname.replace(extName, "").replace(/[^a-zA-Z0-9-_]/g, "");
//     cb(null, Date.now() + "-" + sanitizedName + extName);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const extName = path.extname(file.originalname).toLowerCase();
//   const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName.substring(1));

//   if (!isAllowedFileType) {
//     return cb(createError(400, "File type not supported"));
//   }
//   cb(null, true);
// };

// const uploadNormal = multer({
//   storage,
//   limits: { fileSize: MAX_FILE_SIZE }, // 10 MB limit
//   fileFilter,
// });

// module.exports = { uploadNormal };
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const createError = require("http-errors");
const mime = require("mime-types");

// Ensure upload directory exists asynchronously
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_FOLDER || "public/images/users");

fs.mkdir(UPLOAD_DIR, { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating upload directory:", err);
    throw err;
  }
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

const ALLOWED_FILE_TYPES = [
  "jpg", "jpeg", "png", "xlsx", "csv", "pdf", "doc", "docx",
  "mp3", "wav", "ogg", "mp4", "avi", "mov", "mkv", "webm", "svg"
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extName = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(extName, "")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .substring(0, 50); // Limit filename length to 50 characters
    cb(null, Date.now() + "-" + sanitizedName + extName);
  },
});

const fileFilter = (req, file, cb) => {
  const extName = path.extname(file.originalname).toLowerCase().substring(1);
  const mimeType = mime.extension(file.mimetype);

  const isExtensionAllowed = ALLOWED_FILE_TYPES.includes(extName);
  const isMimeTypeAllowed = ALLOWED_FILE_TYPES.includes(mimeType);

  if (isExtensionAllowed && isMimeTypeAllowed) {
    cb(null, true);
  } else {
    const error = createError(400, "File type not supported");
    error.code = "LIMIT_FILE_TYPE";
    cb(error);
  }
};

const uploadNormal = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }, // 10 MB limit
  fileFilter,
});

module.exports = { uploadNormal };
