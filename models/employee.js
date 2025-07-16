const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  mobile:    { type: String, required: true },
  profileImage: String,
  cvFile: String,
  department: { type: String, required: true },
  role:       { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  salary:    { type: Number, required: true },
  salaryPaid:{ type: Boolean, default: false },
  isPromoted:{ type: Boolean, default: false },
  status:    { type: String, enum: ['Active', 'Fired', 'Resigned'], default: 'Active' },
  company:   { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
