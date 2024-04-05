const User = require("../models/user");
const Job = require("../models/job");
const Interview = require("../models/interview");
const nodemailer = require("nodemailer");

// renders the Home Page
module.exports.getHomePage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("dpc/dpc_home", {
      title: "Schedule An Job",
      layout: "dpc/dpc_layout",
    });
  }

  return res.redirect("/");
};

// renders the addJob page
module.exports.addJob = (req, res) => {
    if (req.isAuthenticated()) {
      return res.render("dpc/add_job", {
        title: "Schedule An Job",
        layout: 'dpc/dpc_layout',
      });
    }
  
    return res.redirect("/");
  };

// creation of new job
module.exports.createJob = async (req, res) => {
    try {
      const {
        companyName,
        jobTitle,
        qualification,
        cgpa,
        allowBacklogStudent,
        package,
        lastDate,
        jobDescription
      } = req.body;
  
      const newJob = await Job.create(
        {
            companyName,
            jobTitle,
            qualification,
            cgpa,
            allowBacklogStudent,
            package,
            lastDate,   
            jobDescription,
        });

        const users = await User.find({});

        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true, // Use `true` for port 465, `false` for all other ports
          auth: {
            user: process.env.MY_EMAIL,
            pass: process.env.MY_EMAIL_APP_PASSWORD,
          },
        });

        users.forEach(async (user) => {
          const mailOptions = {
            from: process.env.MY_EMAIL, // Sender's email address
            to: user.email,
            subject: 'New Job Alert!',
            text: `Dear ${user.username},\n\nA new job "${newJob.jobTitle}" has been posted by ${newJob.companyName}.\n\nFor more details, visit the job portal: http://localhost:5000/student/jobportal\n\nBest regards,\nPlacement-Cell`
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent successfully.');
            }
          });
        });

      // Flash success message
      req.flash("success", "Job added and emails sent successfully!");
      return res.redirect("back");
    } catch (err) {
        console.log(err);
        // Flash error message
        req.flash("error", "Couldn't add Job!");
        return res.redirect("back");
      }
  };
  
  // Deletion of job
  module.exports.destroy = async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await Job.findById(jobId);
  
      if (!job) {
        req.flash("error", "Couldn't find job");
        return;
      }
  
      job.remove();
      req.flash("success", "Job deleted!");
      return res.redirect("back");
    } catch (err) {
      console.log("error", err);
      return;
    }
  };
  
  // renders the addInterview page
module.exports.addInterview = (req, res) => {
    if (req.isAuthenticated()) {
      return res.render("dpc/add_interview", {
        title: "Schedule An Interview",
        layout: 'dpc/dpc_layout',
      });
    }
  
    return res.redirect("/");
  };
  
  // Creation of new interview
  module.exports.createInterview = async (req, res) => {
    try {
      const { company, date } = req.body;
  
      await Interview.create(
        {
          company,
          date,
        },
        (err, Interview) => {
          if (err) {
            req.flash("error", "Couldn't add Interview!");
            return res.redirect("back");
          }
          req.flash("success", "Interview added!");
          return res.redirect("back");
        }
      );
    } catch (err) {
      console.log(err);
    }
  };
  
  // Enrolling student in the interview
  module.exports.enrollInInterview = async (req, res) => {
    try {
      let interview = await Interview.findById(req.params.id);
      const { email, result } = req.body;
  
      if (interview) {
        let student = await Student.findOne({ email: email });
        if (student) {
          // check if already enrolled
          let alreadyEnrolled = await Interview.findOne({
            "students.student": student.id,
          });
  
          // preventing student from enrolling in same company more than once
          if (alreadyEnrolled) {
            if (alreadyEnrolled.company === interview.company) {
              req.flash(
                "error",
                `${student.name} already enrolled in ${interview.company} interview!`
              );
              return res.redirect("back");
            }
          }
  
          let studentObj = {
            student: student.id,
            result: result,
          };
  
          // updating students field of interview by putting reference of newly enrolled student
          await interview.updateOne({
            $push: { students: studentObj },
          });
  
          // updating interview of student
          let assignedInterview = {
            company: interview.company,
            date: interview.date,
            result: result,
          };
          await student.updateOne({
            $push: { interviews: assignedInterview },
          });
  
          req.flash(
            "success",
            `${student.name} enrolled in ${interview.company} interview!`
          );
          return res.redirect("back");
        }
        req.flash("error", "Student not found!");
        return res.redirect("back");
      }
      req.flash("error", "Interview not found!");
      return res.redirect("back");
    } catch (err) {
      req.flash("error", "Error in enrolling interview!");
    }
  };
  
  // deallocating students from an interview
  module.exports.deallocate = async (req, res) => {
    try {
      const { studentId, interviewId } = req.params;
  
      // find the interview
      const interview = await Interview.findById(interviewId);
  
      if (interview) {
        // remove reference of student from interview schema
        await Interview.findOneAndUpdate(
          { _id: interviewId },
          { $pull: { students: { student: studentId } } }
        );
  
        // remove interview from student's schema using interview's company
        await Student.findOneAndUpdate(
          { _id: studentId },
          { $pull: { interviews: { company: interview.company } } }
        );
  
        req.flash(
          "success",
          `Successfully deallocated from ${interview.company} interview!`
        );
        return res.redirect("back");
      }
  
      req.flash("error", "Interview not found");
      return res.redirect("back");
    } catch (err) {
      req.flash("error", "Couldn't deallocate from interview");
    }
  };

  module.exports.getJobPortal = async (req, res) => {
    if(req.isAuthenticated()){
      try {
        const jobs = await Job.find({}); // Limit to 9 jobs for pagination
        return res.render("dpc/job_portal", {
          title: "Job Portal",
          layout: "dpc/dpc_layout",
          jobs: jobs,
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
      return res.render("dpc/job_details", {
        title: "Job Details",
        layout: "dpc/dpc_layout",
        job: job,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }    

  return res.redirect("/");
};

module.exports.getEditJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if(req.isAuthenticated()){
    try {
      return res.render("dpc/edit_job", {
        title: "Edit Job",
        layout: "dpc/dpc_layout",
        job: job,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }    

  return res.redirect("/");
};

// edit job
module.exports.editJob = async (req, res) => {
  try {
    const jobId = req.params.id; // Use req.params.id instead of req.params.jobId
    const {
      companyName,
      jobTitle,
      qualification,
      cgpa,
      allowBacklogStudent,
      package,
      lastDate,
      jobDescription
    } = req.body;

    // Find the job by ID and update its details
    const updatedJob = await Job.findByIdAndUpdate(jobId, {
      companyName,
      jobTitle,
      qualification,
      cgpa,
      allowBacklogStudent,
      package,
      lastDate,
      jobDescription
    }, { new: true });

    // If the job is not found
    if (!updatedJob) {
      req.flash("error", "Job not found!");
      return res.redirect("back");
    }

    // Flash success message
    req.flash("success", "Job updated successfully!");
    return res.redirect(`/dpc/job-details/${updatedJob._id}`);
  } catch (err) {
    console.log(err);
    // Flash error message
    req.flash("error", "Couldn't update Job!");
    return res.redirect("back");
  }
};

