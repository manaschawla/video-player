
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configure Cloudinary using credentials stored in environment variables.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // If no local file path is provided, return null.
        if (!localFilePath) return null;

        // Upload the local file to Cloudinary.
        // "auto" automatically detects the resource type (image, video, etc.).
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Log the uploaded file's URL and return its details.
        console.log("File uploaded to Cloudinary:", response);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        // If uploading fails, delete the temporary local file.
        // force: true is not required here because unlinkSync throws on errors.
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
