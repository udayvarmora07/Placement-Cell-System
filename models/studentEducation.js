const mongoose = require('mongoose');

// Define schema for student education details
const studentEducationDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming there's a User model for the student
    required: true
  },
  tenthSchoolName: {
    type: String,
    required: true,
  },
  tenthBoard: {
    type: String,
    enum: ['GSEB', 'CBSE', 'ICSE', 'Other'],
    required: true
  },
  tenthPassingYear: {
    type: Number,
    enum: ['2018', '2019', '2020', '2021'],
    required: true
  },
  tenthPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  twelfthSchoolName: {
    type: String,
    required: true
  },
  twelfthBoard: {
    type: String,
    enum: ['GSEB', 'CBSE', 'ICSE', 'Other'],
    required: true
  },
  twelfthPassingYear: {
    type: Number,
    enum: ['2020', '2021', '2022', '2023'],
    required: true
  },
  twelfthPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  sem1: { type: Number, min: 0, max: 10, required: true },
  sem2: { type: Number, min: 0, max: 10, required: true },
  sem3: { type: Number, min: 0, max: 10, required: true },
  sem4: { type: Number, min: 0, max: 10, required: true },
  sem5: { type: Number, min: 0, max: 10, required: true },
  sem6: { type: Number, min: 0, max: 10, required: true },
  backlogStatus: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
});

// Create model
const StudentEducationDetails = mongoose.model('StudentEducationDetails', studentEducationDetailsSchema);

module.exports = StudentEducationDetails;
