// server/models/TriageResult.js
import mongoose from 'mongoose';

const TriageResultSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed, // Can reference User ObjectId or custom String ID like 'pat-101'
      ref: 'User',
      required: true,
      index: true
    },
    symptoms: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one symptom must be specified'
      }
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency', 'routine', 'urgent'],
      required: true,
      lowercase: true,
      index: true
    },
    guidanceText: {
      type: String,
      required: true,
      trim: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    vitals: {
      spo2: { type: String, trim: true },
      bp: { type: String, trim: true },
      temp: { type: String, trim: true },
      pulse: { type: String, trim: true }
    },
    duration: {
      type: String,
      trim: true
    },
    painScale: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    recommendedSpecialty: {
      type: String,
      trim: true,
      default: 'General Medicine'
    },
    flagsDetected: {
      red: [{ type: String }],
      moderate: [{ type: String }],
      mild: [{ type: String }]
    },
    requiresImmediateSos: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // createdAt is standard
  }
);

// Indexes
TriageResultSchema.index({ patientId: 1, createdAt: -1 });

export const TriageResult = mongoose.models.TriageResult || mongoose.model('TriageResult', TriageResultSchema);
export default TriageResult;
