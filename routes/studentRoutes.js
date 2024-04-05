const express = require("express");
const router = express.Router();
const multer = require('multer');

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const studentController = require("../controllers/studentController");

//Home
router.get("/home", studentController.getHomePage);

router.get("/home", studentController.getHomePage);
router.get("/jobportal", studentController.getJobPortal);
router.get("/job-details/:id", studentController.getJobDetails);
router.post('/apply-job/:id', studentController.applyJob);
router.get("/add-student-personal-details", studentController.addStudentPersonalDetails);
router.post("/createStudentPersonalDetails", studentController.saveStudentPersonalDetails);
router.get("/add-student-education-details", studentController.addStudentEducationDetails);
router.post("/createStudentEducationDetails", studentController.saveStudentEducationDetails);
router.get("/add-student-document-upload", studentController.addStudentDocumentUpload);
router.post("/createStudentDocumentUpload", upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'signature', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), studentController.saveStudentDocumentUpload);
router.get("/displayUploadedDocuments", studentController.displayUploadedDocuments);
router.get("/studentProfile", studentController.getStudentProfile);
router.get("/edit-personal-details/:id", studentController.getEditPersonalDetails);
router.get("/edit-education-details/:id", studentController.getEditEducationDetails);
router.post("/editPersonalDetails/:id", studentController.editPersonalDetails);
router.post("/editEducationDetails/:id", studentController.editEducationDetails);

module.exports = router;