import express from "express";
const router = express.Router();
// import StartUp from '../../models/startUp/register.js';
import { prisma } from "../../prisma/prisma.js";
import { transport } from "../../packages/mailer/index.js";
import { upload } from "../../middleware/multer.middelware.js"
import { uploadImageMiddleware, uploadResume } from "../../middleware/profileImage.middleware.js";

// OTP
import otpGenerator from "otp-generator";

//Get
router.get("/", async (req, res) => {
  try {
    // const startUp = await StartUp.find()
    const startUp = await prisma.startup.findMany();
    res.status(200).json({
      status: 200,
      length: startUp.length,
      startUps: startUp,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
});

//Get
router.get("/:startUpId", async (req, res) => {
  try {
    // const idToSearch = new ObjectId(req.params.startUpId);
    // const startUpDetails = await StartUp.findById(idToSearch);
    const startUpDetails = await prisma.startup.findUnique({
      where: { id: req.params.startUpId },
      include: { founder: true },
    });
    res.status(200).json({
      status: 200,
      startUpDetails: startUpDetails,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
});

//POST
router.post("/", async (req, res) => {
  try {
    // const checkUserAlreadyExist = await StartUp.findOne({ email: req.body.email })
    const checkUserAlreadyExist = await prisma.startup.findUnique({
      where: { email: req.body.email },
    });
    if (checkUserAlreadyExist === null) {
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      // const startup = new StartUp({
      //     companyName: req.body.companyName,
      //     email: req.body.email,
      //     otp: otp
      // })
      // const newStartUp = await startup.save()
      let newStartUp = await prisma.startup.create({
        data: {
          companyName: req.body.companyName,
          email: req.body.email,
          otp: otp,
        },
      });
      delete newStartUp.otp;
      res.status(200).json({
        status: 200,
        startUpDetails: newStartUp,
      });
      let mailOptions = {
        from: process.env.MAILER_ID,
        to: newStartUp.email,
        subject: "Your One-Time Password (OTP) for Sign Up Verification",
        html: `
                    Dear ${newStartUp.companyName},<br><br>
                    Please enter the following OTP to complete the verification process: <b>${otp}</b>
               `,
      };
      console.log(mailOptions);
      transport.sendMail(mailOptions, function (error) {
        if (error) {
          console.log(error);
        }
      });
    } else {
      res.status(401).json({
        status: 401,
        message: "Account already exist",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
});





//PUT
router.put("/:startUpId", upload.single("image"),uploadImageMiddleware("Startup DP"), async (req, res) => {
  try {

    // Update the startup details in the database
    await prisma.startup.update({
      where: { id: req.params.startUpId },
      data: {
        // Profile image link (if applicable)
        profileimglink: req.imglink,
        foundedDate: req.body.founded,
        sector: req.body.sector,
        location: req.body.location,
        noOfEmployees: req.body.noOfEmployees,
        aboutCompany: req.body.aboutCompany,
        linkedIn: req.body.linkedIn,
        website: req.body.website,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
        youtube: req.body.youtube,
        facebook: req.body.facebook,
        tracxn: req.body.tracxn,
        cruchbase: req.body.cruchbase,
        hrName: req.body.hrName,
        hrEmail: req.body.hrEmail,
        hrDesignation: req.body.hrDesignation,
        hrLinkedin: req.body.hrLinkedin,
      },
    });

    const founders = JSON.parse(req.body.founder);

    // Iterate over the founder array and upsert each founder
    for (let founder of founders) {
      await prisma.founder.upsert({
        where: {
          id_startupId: {
            id:founder.id ,
            startupId: req.params.startUpId,
          },
        },
        update: {
          name: founder.name,
          bio: founder.bio,
          designation: founder.designation,
          linkedIn: founder.linkedIn,
        },
        create: {
          id:founder.id,
          name: founder.name,
          bio: founder.bio,
          designation: founder.designation,
          linkedIn: founder.linkedIn,
          startup: {
            connect: {
              id: req.params.startUpId,
            },
          },
        },
      });
    }

    // Fetch and return the updated startup details
    const updatedStartUp = await prisma.startup.findUnique({
      where: { id: req.params.startUpId },
      include: { founder: true }, // Include founders if needed
    });

    res.status(200).json({
      status: 200,
      startUpDetails: updatedStartUp,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
});


export default router;
