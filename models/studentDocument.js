const mongoose = require('mongoose');

const studentDocumentUploadSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  size: Number,
  data: Buffer
}, { timestamps: true }); // Automatically add createdAt and updatedAt timestamps

const StudentDocumentUpload = mongoose.model('StudentDocumentUpload', studentDocumentUploadSchema);

module.exports = StudentDocumentUpload;
