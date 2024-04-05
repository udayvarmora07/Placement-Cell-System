const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    cgpa: {
        type: Number,
        validate: {
            validator: function(value) {
                // Validate that the value is a float
                return !isNaN(value) && value >= 0 && value <= 10;
            },
            message: "CGPA must be a number between 0 and 10"
        }
    },
    allowBacklogStudent: {
        type: Boolean,
        default: false // Set default value to false
    },
    package: {
        type: String,
        required: true
    },
    lastDate: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
},
{
  timestamps: true,
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;