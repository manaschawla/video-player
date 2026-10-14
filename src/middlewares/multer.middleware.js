import multer from "multer";
import crypto from "crypto";

// Configure where and how uploaded files will be stored.
const storage = multer.diskStorage({
    // Save uploaded files inside the public/temp directory.
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },

    // Set the name of the uploaded file.
    filename: function (req, file, cb) {
        crypto.randomBytes(16, function (err, raw) {
            if (err) return cb(err);

            // Use the original filename for the uploaded file.
            cb(null, file.originalname);
        });
    }
});

// Export Multer middleware to handle file uploads.
export const upload = multer({ storage: storage });