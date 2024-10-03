import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return;

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        //file has been uploaded successfully

        // console.log("File uploaded successfully", response.url);

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        //removes the temporary file saved on local server
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resource_Type) => {
    const response = await cloudinary.uploader
        .destroy(publicId, {resource_type:resource_Type})
        .then((response) => console.log(response));

    return response;
};

export { uploadOnCloudinary, deleteFromCloudinary };
