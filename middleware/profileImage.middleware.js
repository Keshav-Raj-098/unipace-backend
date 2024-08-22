import UploadOnSupabase from "../utils/supabase.js";

const uploadImage = async (req, res, next, bucketName) => {
    const imgfilePath =  req.files?.image?.[0]?.path;

    if (!imgfilePath) {
        console.log('Image not found');
        req.imglink = null; // Set imglink to null if image file path is missing
        return next(); // Call next middleware or route handler
    }

    try {
        const imglink = await UploadOnSupabase(imgfilePath, bucketName);

        if (!imglink) {
            console.log('Error occurred while uploading image');
            req.imglink = null; // Set imglink to null if upload fails
        } else {
            req.imglink = imglink; // Set the image link if upload succeeds
        }
    } catch (error) {
        console.error('Error during image upload:', error);
        req.imglink = null; // Set imglink to null in case of an error
    }

    next(); // Call next middleware or route handler
};



const uploadImageMiddleware = (bucketName) => {
    return (req, res, next) => {
      uploadImage(req, res, next, bucketName);
    };
  };


const uploadResume = async (req, res, next,bucketName) => {
        
    const resumePath = req.files?.Resume?.[0]?.path;

    if (!resumePath) {
        console.log('Resume not found');
        req.resumeLink = null; // Set imglink to null if image file path is missing
        return next(); // Call next middleware or route handler
    }

    try {
        const resumeLink = await UploadOnSupabase(resumePath, bucketName);

        if (!resumeLink) {
            console.log('Error occurred while uploading Resume');
            req.resumeLink = null; // Set imglink to null if upload fails
        } else {
            req.resumeLink = resumeLink; // Set the image link if upload succeeds
        }
    } catch (error) {
        console.error('Error during Resume upload:', error);
        req.resumeLink = null; // Set imglink to null in case of an error
    }

    next(); // Call next middleware or route handler
};


const uploadResumeMiddleware = (bucketName) => {
    return (req, res, next) => {
      uploadResume(req, res, next, bucketName);
    };
  };

export  {uploadImage,uploadResume,uploadImageMiddleware,uploadResumeMiddleware}