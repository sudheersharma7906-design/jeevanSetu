// server/models/Consult.js
import mongoose from 'mongoose';

const ConsultSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed, // User ObjectId or String ID
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true
    },
    rmpId: {
      type: mongoose.Schema.Types.Mixed, // User ObjectId or String ID
      ref: 'User',
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.Mixed, // User ObjectId or String ID
      ref: 'User',
      index: true
    },
    status: {
      type: String,
      enum: ['open', 'escalated', 'closed', 'queued', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
      lowercase: true,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    prescriptionId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Prescription',
      default: null
    },
    targetSpecialty: {
      type: String,
      trim: true,
      default: 'General Medicine'
    },
    urgency: {
      type: String,
      enum: ['EMERGENCY', 'URGENT', 'ROUTINE', 'emergency', 'urgent', 'routine', 'low', 'medium', 'high'],
      default: 'URGENT'
    },
    symptoms: {
      type: String,
      trim: true
    },
    vitals: {
      spo2: { type: String },
      bp: { type: String },
      temp: { type: String },
      pulse: { type: String }
    },
    roomSessionId: {
      type: String,
      trim: true
    },
    diagnosis: {
      type: String,
      trim: true
    },
    advice: {
      type: String,
      trim: true
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for queue querying
ConsultSchema.index({ doctorId: 1, status: 1 });
ConsultSchema.index({ rmpId: 1, status: 1 });
ConsultSchema.index({ patientId: 1, createdAt: -1 });

export const Consult = mongoose.models.Consult || mongoose.model('Consult', ConsultSchema);
export default Consult;
