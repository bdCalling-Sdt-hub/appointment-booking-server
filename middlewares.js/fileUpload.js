// const multer = require("multer");
// const path = require("path");
// const createError = require("http-errors");

// const UPLOAD_DIR = process.env.UPLOAD_FOLDER || "public/images/users";
// const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5242880; // 5 MB
// const ALLOWED_FILE_TYPES = [
//   "jpg",
//   "jpeg",
//   "png",
//   "xlsx",
//   "xls",
//   "csv",
//   "pdf",
//   "doc",
//   "docx",
// ];

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: function (req, file, cb) {
//     const extName = path.extname(file.originalname);
//     cb(
//       null,
//       Date.now() + "-" + file.originalname.replace(extName, "") + extName
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const extName = path.extname(file.originalname).toLowerCase(); // Convert to lower case for case-insensitive comparison
//   const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName.substring(1));
//   if (!isAllowedFileType) {
//     return cb(createError(new Error("File type not supported")));
//   }
//   cb(null, true);
// };

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
//   fileFilter: fileFilter,
// });

// module.exports = upload;




const multer = require("multer");
const path = require("path");
const fs = require("fs");
const createError = require("http-errors");
const { log } = require("console");
const sharp = require("sharp");

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
    // const userId = req.userId ? req.userId : 'unknown_user';
    const id = req.body;
    // log("id=========>", id.userId);
    const userDir = path.join(UPLOAD_DIR, id.userId);

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

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
  fileFilter: fileFilter,
});

const convertImageWithId = (req, res, next) => {
  // if (!req.files) {
  //   return next();
  // }
  console.log("req.file=========>", req.files);
console.log("req.body=========>", req.body);
  const userId = req.body.userId;
  console.log("userId=========>", userId);
  const userDir = path.join(UPLOAD_DIR, userId);
  const filePath = path.join(userDir, req.files.image[0]?.filename);
  const extName = path.extname(req.files.image[0].originalname).toLowerCase().substring(1);

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

module.exports = { upload, convertImageWithId };

