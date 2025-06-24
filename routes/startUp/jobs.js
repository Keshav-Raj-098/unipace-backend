import express from "express"
const router = express.Router()
// import Jobs from '../../models/student/jobs.js';
// import StartUp from '../../models/startUp/register.js';
// import Student from '../../models/student/register.js';
import {prisma} from "../../prisma/prisma.js";
// import { ObjectId } from 'mongodb';
import { authenticationMiddleware } from '../../middleware/auth.js';

//Get
router.get('/',authenticationMiddleware, async (req, res) => {//check for all details
    try {
        // const jobs = await Jobs.find(
        //     { 
        //         $and: [
        //             { startUpId: req.query.startUpId }, 
        //             { type: req.query.type },
        // ]}).sort({"createdAt":-1,"deadline":1})
        const jobs = await prisma.job.findMany({
            where: {
                startupId: req.query.startUpId,
                // type: req.query.type
            },
            orderBy: [
                { createdAt: 'desc' },
                { deadline: 'asc' }
            ]
        });
        
        
        res.status(200).json({
            status: 200,
            length: jobs.length,
            jobs: jobs
            
        })
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

//Get
router.get('/:jobId', async (req, res) => {
    try {
        // const idToSearch = new ObjectId(req.params.jobId);
        // const job = await Jobs.findById(idToSearch);
        const job=await prisma.job.findUnique({where:{id:req.params.jobId},include:{studentsApplied:{include:{student:true}}}})
        console.log(job);
        
        res.status(200).json({
            status: 200,
            jobDetails: job
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
        const newJob=await prisma.job.create({data:{
            companyName: req.body.companyName,
            title: req.body.title,
            type: req.body.type,
            // duration: req.body.duration,
            salary: req.body.salary,
            totalApplications: req.body.totalApplications,
            totalRequired: req.body.totalRequired,
            skillsRequired: req.body.skills,
            jobLocation: req.body.jobLocation,
            description:req.body.description,
            perks:req.body.perks,
            category:req.body.category,
            addSkill:req.body.addSkill,
            qualification:req.body.qualification,
            responsibilities: req.body.responsibilities,
            assignment: req.body.assignment,
            deadline:req.body.deadline,
            selectionProcess: req.body.selectionProcess,
            startupId: req.body.startupId,
            createdAt: req.body.createdAt,

            approval : "pending",
            startup:{connect:{id:req.body.startUpId}}
        }})
        
       
        const startUpDetails=await prisma.startup.findUnique({where:{id:req.body.startUpId}})
       
        res.status(201).json({
            status: 201,
            jobDetails: newJob,
            startUpDetails: startUpDetails
        })
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})


//PUT
router.put('/:jobId', async (req, res) => {
    try {
        // const jobIdToSearch = new ObjectId(req.params.jobId);
        // const updatedjob = await Jobs.updateOne(
        //     { _id: jobIdToSearch, "studentsApplied.studentId": req.body.studentId },
        //     { $set: { "studentsApplied.$.status": req.body.status } },
        //     { 'new': true }
        // )
        
        // const studentIdToSearch = new ObjectId(req.body.studentId);
        // const updatedStudent = await Student.updateOne(
        //     { _id: studentIdToSearch, "jobsApplied.jobId": req.params.jobId },
        //     { $set: { "jobsApplied.$.status": req.body.status } },
        //     { 'new': true }
        // )
        
        await prisma.studentApplication.update(
            {where:{jobId_studentId:{jobId:req.params.jobId,studentId:req.body.studentId}},
            data:{status:req.body.status}})
        const updatedjob=await prisma.job.findUnique({where:{id:req.params.jobId}})
        const updatedStudent=await prisma.student.findUnique({where:{id:req.body.studentId}})
        res.status(200).json({
            status: 200,
            studentDetails: updatedStudent,
            jobDetails: updatedjob
        })

    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

//PUT
router.put('/update/:jobId', async (req, res) => {
    try {
        // const jobIdToSearch = new ObjectId(req.params.jobId);
        // const updatedjob = await Jobs.updateOne(
        //     { _id: jobIdToSearch },
        //     {
        //         $set: {
        //             designation: req.body.designation,
        //             duration: req.body.duration,
        //             stipend: req.body.stipend,
        //             noOfOffers: req.body.noOfOffers,
        //             skillsRequired: req.body.skillsRequired,
        //             jobLocation: req.body.jobLocation,
        //             responsibilities: req.body.responsibilities,
        //             assignment: req.body.assignment,
        //             deadline: req.body.deadline,
        //             selectionProcess: req.body.selectionProcess,
        //             createdAt: req.body.createdAt,
        //             approval : "pending",

        //         }
        //     },
        //     { 'new': true }
        // )
        const updatedjob=await prisma.job.update({where:{id:req.params.jobId},data:{
            designation: req.body.designation,
            duration: req.body.duration,
            stipend: req.body.stipend,
            noOfOffers: req.body.noOfOffers,
            skillsRequired: req.body.skillsRequired,
            jobLocation: req.body.jobLocation,
            responsibilities: req.body.responsibilities,
            assignment: req.body.assignment,
            deadline: req.body.deadline,
            selectionProcess: req.body.selectionProcess,
            createdAt: req.body.createdAt,
            approval : "pending",
        }})
        res.status(200).json({
            status: 200,
            jobDetails: updatedjob
        })
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

// Get All applications
//GET
// Route to get students and job details by startupId
router.get('/allApplication/:startupId', async (req, res) => {
    const { startupId } = req.params;
  
    try {
      // 1. Find all jobs associated with the startupId
      const jobs = await prisma.job.findMany({
        where: {
          startupId: startupId,
        },
        select: {
          id: true,
          title: true,
        },
      });
  
      const jobIds = jobs.map(job => job.id);
  
      if (jobIds.length === 0) {
        return res.status(404).json({ message: 'No jobs found for this startup' });
      }
  
      // 2. Find all student applications associated with the jobIds
      const applications = await prisma.studentApplication.findMany({
        where: {
          jobId: {
            in: jobIds,
          },
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true, // Including additional job details if needed
            },
          },
          student: true, // Include the student details
        },
      });
  
      if (applications.length === 0) {
        return res.status(404).json({ message: 'No students found for these jobs' });
      }
  
      // 3. Format the response to include job details, student information, and applied date
      const response = applications.map(app => ({
        student: app.student, // Full student schema
        job: {
          id: app.job.id,
          title: app.job.title,
          status: app.status, // Status of the application
          applied: app.applied, // Add the applied date
        },
      }));
  
      // 4. Send the formatted response
      res.status(200).json({
        status: 200,
        applicant: response,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching students' });
    }
  });
  
  














export default router