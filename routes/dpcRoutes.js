const express = require("express");
const router = express.Router();

const dpcController = require("../controllers/dpcController");

//Home
router.get("/home", dpcController.getHomePage);

//job
router.get("/jobportal", dpcController.getJobPortal);
router.get("/job-details/:id", dpcController.getJobDetails);
router.get("/add-job", dpcController.addJob);
router.post("/createJob", dpcController.createJob);
router.get("/edit-job/:id", dpcController.getEditJob);
router.post("/editJob/:id", dpcController.editJob);

//interview
router.get("/add-interview", dpcController.addInterview);
router.post("/createInterview", dpcController.createInterview);
router.post("/enroll-in-interview/:id", dpcController.enrollInInterview);
router.get("/deallocate/:studentId/:interviewId", dpcController.deallocate);

module.exports = router;