const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  collegeId: { type: String, required: true },
  program: { type: String, required: true },
  branch: { type: String, required: true },
  enrollmentYear: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  moNumber: { type: Number, required: true },
  gender: { type: String, required: true },
  birthDate: { type: Date, required: true },
  schoolName: { type: String},
  board: { type: String },
  passingYear: { type: Number },
  percentage: { type: Number },
  sem1: { type: Number },
  sem2: { type: Number },
  sem3: { type: Number },
  sem4: { type: Number },
  sem5: { type: Number },
  sem6: { type: Number },
  backlogStatus: { type: String },
  semester1Backlogs: [String],
  semester2Backlogs: [String],
  semester3Backlogs: [String],
  semester4Backlogs: [String],
  semester5Backlogs: [String],
  semester6Backlogs: [String]
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
