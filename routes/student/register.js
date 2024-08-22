import express from "express"
const router = express.Router()
import { transport } from "../../packages/mailer/index.js";
import { prisma } from "../../prisma/prisma.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from "../../middleware/multer.middelware.js"
import { uploadImageMiddleware, uploadResumeMiddleware } from "../../middleware/profileImage.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// OTP
import otpGenerator from 'otp-generator';
import multer from 'multer';
import { google } from 'googleapis';
const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const drive = google.drive('v3');
import fs from 'fs';
import apikeys from '../../creds_prod.json' assert { type: 'json' };

//Get
router.get('/', async (req, res) => {
    try {
        const student = await prisma.student.findMany()
        res.status(200).json({
            status: 200,
            length: student.length,
            students: student
        })
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

router.get('/:studentId', async (req, res) => {
    try {
        const studentDetails = await prisma.student.findUnique({ where: { id: req.params.studentId } })
        console.log(studentDetails);

        res.status(200).json({
            status: 200,
            studentDetails: studentDetails
        })
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

//POST
router.post('/', async (req, res) => {
    try {
        const checkUserAlreadyExist = await prisma.student.findUnique({ where: { email: req.body.email.toLowerCase() } })
        if (checkUserAlreadyExist === null) {
            const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            const newStudent = await prisma.student.create({ data: { name: req.body.name, email: req.body.email.toLowerCase(), otp: otp, isVerified: true } })
            delete newStudent.otp
            res.status(200).json({
                status: 200,
                studentDetails: newStudent
            })
            var mailOptions = {
                from: process.env.MAILER_ID,
                to: newStudent.email,
                subject: "Your One-Time Password (OTP) for Sign Up Verification",
                html: `
                Dear ${newStudent.name},<br><br>
                Please enter the following OTP to complete the verification process: <b>${otp}</b>
                `
            };
            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });
        }
        else {
            res.status(401).json({
                status: 401,
                message: "Account already exist"
            })
        }
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})


const SCOPE = process.env.SCOPE_UPLOAD;
//PUT
router.put('/:studentId', upload.fields([
    {
        name: "image",
        maxCount: 1
    },
    {
        name: "Resume",
        maxCount: 1
    }
]), uploadResumeMiddleware("Resume"), uploadImageMiddleware("Student DP"), async (req, res) => {
    try {
        const data = {
            course: req.body.course,
            department: req.body.department,
            year: req.body.year,
            cgpa: req.body.cgpa,
            linkedIn: req.body.linkedIn,
            isVerified: true,
            college: req.body.college,
        };

        // Conditionally add imglink and resumeLink if they exist
        if (req.imglink) {
            data.imglink = req.imglink;
        }

        if (req.resumeLink) {
            data.resumeLink = req.resumeLink;
        }

        const updatedStudent = await prisma.student.update({
            where: { id: req.params.studentId },
            data: data,
        });

        if (!updatedStudent) {
            return res.status(500).json({ message: "Can't update" });
        }

        return res.status(200).json({
            status: 200,
            studentDetails: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student:', error);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
});


export default router

async function authorize() {
    try {
        const jwtClient = new google.auth.JWT(
            apikeys.client_email,
            null,
            apikeys.private_key,
            SCOPE
        );

        // Check if the token is expired and refresh if needed
        if (jwtClient.isTokenExpiring()) {
            await jwtClient.refreshToken();
        }

        await jwtClient.authorize();
        return jwtClient;
    } catch (error) {
        console.error('Authorization Error:', error.message);
        throw error; // Rethrow the error to be caught in the calling function
    }
}

