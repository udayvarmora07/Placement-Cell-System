// Import Mongoose
const mongoose = require('mongoose');

// Define student personal details schema
const studentPersonalDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  collegeId: {
    type: String,
    required: true
  },
  program: {
    type: String,
    enum: ['Bachelor'], // Assuming only one option for program
    required: true
  },
  branch: {
    type: String,
    enum: ['Computer Science', 'Information Technology', 'Chemical Engineering', 'Electrical and Communication Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Instrumentation and Control Engineering'],
    required: true
  },
  enrollmentYear: {
    type: Number,
    enum: ['2020', '2021', '2022', '2023'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Assuming email is unique
  },
  moNumber: {
    type: String, // Assuming mobile number as string for flexibility (can be changed as needed)
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  }
});

// Create and export StudentPersonalDetails model
const StudentPersonalDetails = mongoose.model('StudentPersonalDetails', studentPersonalDetailsSchema);
module.exports = StudentPersonalDetails;