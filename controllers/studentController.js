const Job = require("../models/job");
const Interview = require("../models/interview");
const User = require("../models/user");
const StudentPersonalDetails = require("../models/studentPersonal");
const StudentEducationDetails = require("../models/studentEducation");
const { google } = require('googleapis');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// renders the Home Page
module.exports.getHomePage = (req, res) => {
    if (req.isAuthenticated()) {
      return res.render("student/student_home", {
        title: "Home Page",
        layout: "student/student_layout",
        active: "home",
      });
    }
  
    return res.redirect("/");
  };

  module.exports.getJobPortal = async (req, res) => {
    if(req.isAuthenticated()){
      try {
        const jobs = await Job.find({}); // Limit to 9 jobs for pagination
        return res.render("student/job_portal", {
          title: "Job Portal",
          layout: "student/student_layout",
          jobs: jobs,
          active: "jobportal",
        });
      } catch (err) {
        console.log(err);
        res.redirect("/");
      }
    }
    
    return res.redirect("/");
  };

  // Renders the job details page
module.exports.getJobDetails = async (req, res) => {
  if(req.isAuthenticated()){
    try {
      const job = await Job.findById(req.params.id);
      return res.render("student/job_details", {
        title: "Job Details",
        layout: "student/student_layout",
        job: job,
        active: "jobportal",
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }    

  return res.redirect("/");
};

// Controller function to apply for a job
module.exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user._id;

    // Check if user is authenticated
    if (!studentId) {
      req.flash('error', 'User not authenticated.');
      return res.redirect('/login'); // Redirect to login page or handle authentication
    }

    const studentEducationDetails = await StudentEducationDetails.findOne({ user: studentId });

    if (!studentEducationDetails) {
      req.flash('error', 'Please provide your education details before applying for jobs.');
      return res.redirect('/student/add-student-education-details');
    }

    const job = await Job.findById(jobId);

    // Calculate average CGPA
    const { sem1, sem2, sem3, sem4, sem5, sem6 } = studentEducationDetails;
    const totalCGPA = (sem1 + sem2 + sem3 + sem4 + sem5 + sem6) / 6;

    if (totalCGPA >= job.cgpa) {
      // Find and update the user with the applied job
      const user = await User.findByIdAndUpdate(studentId, { $push: { appliedJobs: jobId } });

      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/login'); // Redirect to login page or handle authentication
      }

      req.flash('success', 'Applied for job successfully!');
      return res.redirect('/student/jobportal');
    } else {
      req.flash('error', 'You are not eligible for this company.');
      return res.redirect('/student/jobportal');
    }
  } catch (error) {
    console.error('Error applying for job:', error);
    req.flash('error', 'Failed to apply for job. Please try again later.');
    return res.redirect('/student/jobportal');
  }
};


// render student personal details form
module.exports.addStudentPersonalDetails = (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("student/student_personal_details", {
      title: "Personal details",
      layout: 'student/student_layout',
      active: "add-student-details",
    });
  }

  return res.redirect("/");
};

// save student personal details
module.exports.saveStudentPersonalDetails = async (req, res) => {
 // Extract data from the request body
 const { fullName, collegeId, program, branch, enrollmentYear, email, moNumber, gender, birthDate } = req.body;

 try {
     // Create a new instance of StudentPersonalDetails
     const studentPersonal = new StudentPersonalDetails({
        userId: req.user._id,
         fullName,
         collegeId,
         program,
         branch,
         enrollmentYear,
         email,
         moNumber,
         gender,
         birthDate
     });

     // Save the data into the database
     await studentPersonal.save();

     // Redirect to the education details page
     res.redirect("/student/add-student-education-details");
 } catch (error) {
     console.error("Error saving student personal details:", error);
     res.status(500).send("Error saving student personal details");
 }
};

// render student education details form
module.exports.addStudentEducationDetails = (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("student/student_education_details", {
      title: "Education details",
      layout: 'student/student_layout',
      active: "add-student-details",
    });
  }

  return res.redirect("/");
};

// save student education details
module.exports.saveStudentEducationDetails = async (req, res) => {
  try {
    // Extract data from request body
    const {
      tenthSchoolName,
      tenthBoard,
      tenthPassingYear,
      tenthPercentage,
      twelfthSchoolName,
      twelfthBoard,
      twelfthPassingYear,
      twelfthPercentage,
      sem1,
      sem2,
      sem3,
      sem4,
      sem5,
      sem6,
      backlogStatus,
    } = req.body;

    // Create student education object
    const studentEducationDetails = new StudentEducationDetails({
      userId: req.user._id,
      tenthSchoolName,
      tenthBoard,
      tenthPassingYear,
      tenthPercentage,
      twelfthSchoolName,
      twelfthBoard,
      twelfthPassingYear,
      twelfthPercentage,
      sem1,
      sem2,
      sem3,
      sem4,
      sem5,
      sem6,
      backlogStatus,
    });

    // Save student education details to the database
    await studentEducationDetails.save();

    // Redirect to the document upload page
    res.redirect("/student/add-student-document-upload");
  } catch (error) {
    // Handle errors
    console.error('Error saving student education details:', error);
    res.status(500).json({ error: 'An error occurred while saving student education details' });
  }
};

// render student document upload
module.exports.addStudentDocumentUpload = (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("student/student_document_upload", {
      title: "Document Upload",
      layout: 'student/student_layout',
      active: "add-student-details",
    });
  }

  return res.redirect("/");
};

const StudentDocumentUpload = require("../models/studentDocument");

module.exports.saveStudentDocumentUpload = async (req, res) => {
  try {
    const { photo, signature, resume } = req.files;
    
    // Save uploaded files to the database with additional details
    const photoUpload = new StudentDocumentUpload({
      filename: photo.name,
      contentType: photo.mimetype,
      size: photo.size,
      data: photo.data
    });
    
    const signatureUpload = new StudentDocumentUpload({
      filename: signature.name,
      contentType: signature.mimetype,
      size: signature.size,
      data: signature.data
    });
    
    const resumeUpload = new StudentDocumentUpload({
      filename: resume.name,
      contentType: resume.mimetype,
      size: resume.size,
      data: resume.data
    });

    // Save documents to the database
    await Promise.all([
      photoUpload.save(),
      signatureUpload.save(),
      resumeUpload.save()
    ]);

    res.redirect("/student/displayUploadedDocuments");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.displayUploadedDocuments = async (req, res) => {
  try {
        const uploadedDocuments = await StudentDocumentUpload.find();
        res.render("student/displayUploadedDocuments", {
          uploadedDocuments,
          title: "Display Document",
          layout: 'student/student_layout',
          active: "add-student-details",
        });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

module.exports.getStudentProfile = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user._id); // Assuming you have stored user's id in req.user._id
      const personalDetails = await StudentPersonalDetails.findOne({ userId: req.user._id });
      const educationDetails = await StudentEducationDetails.findOne({ userId: req.user._id });

      if (!personalDetails || !educationDetails) {
        // Handle case where personal or education details are not found for the user
        return res.status(404).send("Personal or education details not found for the user.");
      }

      return res.render("student/studentProfile", {
        title: "Profile",
        layout: 'student/student_layout',
        active: "profile",
        personalDetails: personalDetails,
        educationDetails: educationDetails,
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return res.status(500).send("Error fetching profile data");
    }
  }

  return res.redirect("/");
};

module.exports.getEditPersonalDetails = async (req, res) => {
  const personalDetails = await StudentPersonalDetails.findById(req.params.id);
  if(req.isAuthenticated()){
    try {
      return res.render("student/edit_personal_details", {
        title: "Edit Personal Details",
        layout: "student/student_layout",
        personalDetails: personalDetails,
        active: "profile",
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }    

  return res.redirect("/");
};

module.exports.getEditEducationDetails = async (req, res) => {
  const educationDetails = await StudentEducationDetails.findById(req.params.id);
  if(req.isAuthenticated()){
    try {
      return res.render("student/edit_education_details", {
        title: "Edit Education Details",
        layout: "student/student_layout",
        educationDetails: educationDetails,
        active: "profile",
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }    

  return res.redirect("/");
};

module.exports.editPersonalDetails = async (req, res) => {
  try{
    const personalDetailsId = req.params.id;
    const {
      fullName,
      collegeId,
      program,
      branch,
      enrollmentYear,
      email,
      moNumber,
      gender,
      birthDate
    } = req.body;

    const updatePersonalDetails = await StudentPersonalDetails.findByIdAndUpdate(personalDetailsId, {
      fullName,
      collegeId,
      program,
      branch,
      enrollmentYear,
      email,
      moNumber,
      gender,
      birthDate
    }, { new: true });

    if (!updatePersonalDetails) {
      req.flash("error", "Personal Details not found!");
      return res.redirect("back");
    }

    req.flash("success", "Personal Details updated successfully!");
    return res.redirect('/student/studentProfile');

  }catch(err){

  }
};

module.exports.editEducationDetails = async (req, res) => {
  try{
    const educationDetailsId = req.params.id;
    const {
      tenthSchoolName,
      tenthBoard,
      tenthPassingYear,
      tenthPercentage,
      twelfthSchoolName,
      twelfthBoard,
      twelfthPassingYear,
      twelfthPercentage,
      sem1,
      sem2,
      sem3,
      sem4,
      sem5,
      sem6,
      backlogStatus,
    } = req.body;

    const updateEducationDetails = await StudentEducationDetails.findByIdAndUpdate(educationDetailsId, {
      tenthSchoolName,
      tenthBoard,
      tenthPassingYear,
      tenthPercentage,
      twelfthSchoolName,
      twelfthBoard,
      twelfthPassingYear,
      twelfthPercentage,
      sem1,
      sem2,
      sem3,
      sem4,
      sem5,
      sem6,
      backlogStatus,
    }, { new: true });

    if (!updateEducationDetails) {
      req.flash("error", "Education Details not found!");
      return res.redirect("back");
    }

    req.flash("success", "Education Details updated successfully!");
    return res.redirect('/student/studentProfile');

  }catch(err){

  }
};