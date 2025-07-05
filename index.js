import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()

// import mongoose from 'mongoose'


// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection
// db.on('error', (error) => console.log(error))
// db.once('open', () => console.log('Connected to Database'))

import cors from 'cors'
app.use(cors())
app.use(express.json())

// app.get('/', (req, res) => {
    //     res.send('Job Portal Backend')
    // })
    
    import { authenticationMiddleware } from './middleware/auth.js'
    
    app.get('/', (req, res) => {
        res.send('Job Portal Backend')
    })
    
    // Student side auth api
    import studentRegisterRouter from './routes/student/register.js'
    app.use('/api/student/register', studentRegisterRouter)
    
    import studentLoginRouter from './routes/student/login.js'
    app.use('/api/student/login', studentLoginRouter)
    
    // StartUp side auth api
    
    import startUpRegisterRouter from './routes/startUp/register.js'
    app.use('/api/startUp/register', startUpRegisterRouter)
    
    import startUpLoginRouter from './routes/startUp/login.js'
    app.use('/api/startUp/login', startUpLoginRouter);
    
    
import studentJobsRouter from './routes/student/jobs.js'
app.use('/api/student/jobs',authenticationMiddleware,studentJobsRouter);

// StartUp side api

import startUpJobsRouter from './routes/startUp/jobs.js'
app.use('/api/startUp/jobs',authenticationMiddleware,startUpJobsRouter);


// Sending Client Files
// DO NO REMOVE BELOW TWO LINES, THEY ARE FOR FUTURE USE
// The below commented line is for the case if we want to directly serve the frontend as client files here itself

// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve the static files from the React app
// app.use(express.static(path.join(__dirname, 'client')));

// // Handles any requests that don't match the ones above
// app.get('*', (req, res) => {
//     // res.sendFile(path.join(__dirname + '/client/index.html')); 
//     res.status(404).send("not found");
// });



const port = process.env.PORT || 10000

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
