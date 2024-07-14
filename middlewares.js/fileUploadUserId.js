const multer = require("multer");
const path = require("path");
const fs = require("fs");
const createError = require("http-errors");
const sharp = require("sharp");
const { log } = require("console");

const UPLOAD_DIR = process.env.UPLOAD_FOLDER || "public/images/users";
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5242880; // 5 MB
const ALLOWED_FILE_TYPES = [
  "jpg",
  "jpeg",
  "png",
  "heif",
  "heic",
  "xlsx",
  "xls",
  "csv",
  "pdf",
  "doc",
  "docx",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.userId ? req.userId : 'unknown_user';
    const userDir = path.join(UPLOAD_DIR, userId);

    // Create the directory if it doesn't exist
    fs.mkdirSync(userDir, { recursive: true });

    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const extName = path.extname(file.originalname);
    cb(null, `user${extName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extName = path.extname(file.originalname).toLowerCase().substring(1); // Convert to lower case and remove the leading dot
  const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
  if (!isAllowedFileType) {
    return cb(createError(400, "File type not supported"), false); // Properly create an error with a status code
  }
  cb(null, true);
};

const uploadUserId = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
  fileFilter: fileFilter,
});

const convertImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const userId = req.userId ? req.userId : 'unknown_user';
  const userDir = path.join(UPLOAD_DIR, userId);
  const filePath = path.join(userDir, req.file.filename);
  const extName = path.extname(req.file.originalname).toLowerCase().substring(1);

  console.log(`Preparing to convert file at path: ${filePath} with extension: ${extName}`);

  if (["jpg", "jpeg", "heif", "heic"].includes(extName)) {
    
    const outputFilePath = path.join(userDir, 'user.png');

    console.log(`Converting file at path: ${filePath} to PNG at path: ${outputFilePath}`);

    fs.stat(filePath, async (err, stats) => {
      if (err) {
        console.error(`Error checking file status: ${err.message}`);
        return next(createError(500, `Error checking file status: ${err.message}`));
      }
log("stats==============>",filePath)
      try {
        await sharp(filePath)
          .toFormat('png')
          .toFile(outputFilePath);

        console.log(`File successfully converted to PNG at path: ${outputFilePath}`);

      

        next();
      } catch (error) {
        console.error(`Error during image conversion: ${error.message}`);
        return next(createError(500, `Error converting image: ${error.message}`));
      }
    });
  } else {
    next();
  }
};

module.exports = { uploadUserId, convertImage };



// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const createError = require("http-errors");
// const sharp = require("sharp");

// const UPLOAD_DIR = process.env.UPLOAD_FOLDER || "public/images/users";
// const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5242880; // 5 MB
// const ALLOWED_FILE_TYPES = [
//   "jpg",
//   "jpeg",
//   "png",
//   "heif",
//   "heic",
//   "xlsx",
//   "xls",
//   "csv",
//   "pdf",
//   "doc",
//   "docx",
// ];

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const userId = req.userId ? req.userId : 'unknown_user';
//     const userDir = path.join(UPLOAD_DIR, userId);

//     // Create the directory if it doesn't exist
//     fs.mkdirSync(userDir, { recursive: true });

//     cb(null, userDir);
//   },
//   filename: function (req, file, cb) {
//     const extName = path.extname(file.originalname);
//     cb(null, `user${extName}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const extName = path.extname(file.originalname).toLowerCase().substring(1); // Convert to lower case and remove the leading dot
//   const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
//   if (!isAllowedFileType) {
//     return cb(createError(400, "File type not supported"), false); // Properly create an error with a status code
//   }
//   cb(null, true);
// };

// const uploadUserId = multer({
//   storage: storage,
//   limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
//   fileFilter: fileFilter,
// });

// const convertImage = (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }

//   const userId = req.userId ? req.userId : 'unknown_user';
//   const userDir = path.join(UPLOAD_DIR, userId);
//   const filePath = path.join(userDir, req.file.filename);
//   const extName = path.extname(req.file.originalname).toLowerCase().substring(1);

//   console.log(`Preparing to convert file at path: ${filePath} with extension: ${extName}`);

//   if (["jpg", "jpeg", "heif", "heic"].includes(extName)) {
//     const outputFilePath = path.join(userDir, 'user.png');

//     fs.stat(filePath, async (err, stats) => {
//       if (err) {
//         console.error(`Error checking file status: ${err.message}`);
//         return next(createError(500, `Error checking file status: ${err.message}`));
//       }

//       try {
//         await sharp(filePath)
//           .toFormat('png')
//           .toFile(outputFilePath);

//         console.log(`File successfully converted to PNG at path: ${outputFilePath}`);

//         // Introduce a short delay and retry mechanism for deleting the original file
//         const retryDelete = (retries) => {
//           setTimeout(() => {
//             fs.unlink(filePath, (err) => {
//               if (err) {
//                 if (retries > 0) {
//                   console.warn(`Retrying file delete. Attempts left: ${retries}`);
//                   retryDelete(retries - 1);
//                 } else {
//                   console.error(`Error removing original file after retries: ${err.message}`);
//                   return next(createError(500, `Error removing original file after retries: ${err.message}`));
//                 }
//               } else {
//                 console.log(`Original file removed from path: ${filePath}`);

//                 // Update the file info in the request
//                 req.file.filename = 'user.png';
//                 req.file.path = outputFilePath;

//                 next();
//               }
//             });
//           }, 1000); // 1-second delay
//         };

//         retryDelete(3); // Try up to 3 times
//       } catch (error) {
//         console.error(`Error during image conversion: ${error.message}`);

//         if (extName === "heic" || extName === "heif") {
//           console.error("HEIC/HEIF conversion failed. Please ensure libvips is installed and properly configured.");
//           return next(createError(500, "Error converting HEIC/HEIF image. Ensure libvips is installed and properly configured."));
//         } else {
//           return next(createError(500, `Error converting image: ${error.message}`));
//         }
//       }
//     });
//   } else {
//     next();
//   }
// };

// module.exports = { uploadUserId, convertImage };
