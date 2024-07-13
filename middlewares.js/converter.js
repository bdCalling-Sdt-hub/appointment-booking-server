const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp'); // Versatile image processing library

const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff']; // Supported formats

const convertImageToPngMiddleware = (UPLOADS_FOLDER) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next(); // No uploaded file, move on
    }

    const originalExt = path.extname(req.file.originalname).toLowerCase();
    const isSupportedFormat = supportedFormats.includes(originalExt.slice(1)); // Remove leading dot

    if (!isSupportedFormat) {
      return next(); // Unsupported format, move on
    }

    const buffer = await fs.readFile(req.file.path);

    try {
      const pngBuffer = await sharp(buffer)
        .png() // Convert to PNG format
        .toBuffer();

      const originalFileName = path.basename(req.file.originalname, originalExt);
      const currentDateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const pngFileName = `${originalFileName}_${currentDateTime}.png`;
      const pngFilePath = path.join(UPLOADS_FOLDER, pngFileName);

      await fs.writeFile(pngFilePath, pngBuffer);
      await fs.unlink(req.file.path); // Remove original file

      req.file.path = pngFilePath;
      req.file.filename = pngFileName;
      req.file.mimetype = 'image/png';

      next();
    } catch (error) {
      console.error('Error converting image:', error);
      // Handle conversion errors (e.g., corrupted file, unsupported format within format group)
      // You might want to return an error response to the client
      next(error);
    }
  };
};

module.exports = convertImageToPngMiddleware;