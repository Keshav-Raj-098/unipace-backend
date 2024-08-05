import UploadOnSupabase from "../utils/supabase.js";

const uploadImage = async (req, res, next) => {
     
    const imgfilePath = req.files?.image[0]?.path;

    // if (!imgfilePath) {
    //     console.log('Image not found');
    //     return res.status(400).json({ error: 'Image not found' });
    // }

    const imglink = await UploadOnSupabase(imgfilePath);
    // console.log("this is link",imglink);
    



    // if (!imglink) {
    //     console.log('Error occurred while uploading image');
    //     return res.status(500).json({ error: 'Image upload failed' });
    // }

    // Add the image link to the req object
    req.imglink = imglink;

    // Proceed to the next middleware or route handler
    next();
};


const uploadResume = async (req, res, next) => {
     
    const resumefilePath = req.files?.resume[0]?.path;
    console.log(resumefilePath);
    

    if (!resumefilePath) {
        console.log('Resume not found');
        return res.status(400).json({ error: 'Resume not found' });
    }

    const resumelink = await UploadOnSupabase(resumefilePath);
    console.log("this is link",resumelink);
    



    if (!resumelink) {
        console.log('Error occurred while uploading resume');
        return res.status(500).json({ error: 'resume upload failed' });
    }

    // Add the image link to the req object
    req.resumelink = resumelink;

    // Proceed to the next middleware or route handler
    next();
};
export  {uploadImage,uploadResume}