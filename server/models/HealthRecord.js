// server/models/HealthRecord.js
import mongoose from 'mongoose';

/**
 * HealthRecord Schema (Append-only EHR Timeline Entries)
 * Strictly append-only: Every clinical event (symptom, consult, prescription, emergency)
 * creates a tamper-resistant historical timeline entry.
 */
const HealthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed, // Patient ObjectId or String ID
      ref: 'User',
      required: [true, 'Patient reference is required for health timeline'],
      index: true
    },
    type: {
      type: String,
      enum: [
        'symptom',
        'consult',
        'prescription',
        'emergency',
        // Human-friendly title aliases
        'symptom_triage',
        'teleconsultation',
        'digital_prescription',
        'emergency_sos'
      ],
      required: [true, 'Record type is required'],
      lowercase: true,
      index: true
    },
    refId: {
      type: mongoose.Schema.Types.Mixed, // References triageResult, consult, prescription, emergencyRequest
      default: null,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true
    },
    doctorOrRmpName: {
      type: String,
      trim: true,
      default: 'JivanSetu Health Network'
    },
    facility: {
      type: String,
      trim: true,
      default: 'Rural Health Center'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        fileType: { type: String }
      }
    ],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false, // append-only using timestamp field
    versionKey: false
  }
);

// Timeline query index
HealthRecordSchema.index({ patientId: 1, timestamp: -1 });

export const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);
export default HealthRecord;
