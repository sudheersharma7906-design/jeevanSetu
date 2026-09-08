// server/models/Prescription.js
import mongoose from 'mongoose';

const MedicineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      default: 'Once Daily',
      trim: true
    },
    duration: {
      type: String,
      default: '5 Days',
      trim: true
    },
    instructions: {
      type: String,
      default: 'Take after meals',
      trim: true
    }
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    consultId: {
      type: mongoose.Schema.Types.Mixed, // Consult ObjectId or String ID
      ref: 'Consult',
      default: null,
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.Mixed, // Doctor ObjectId or String ID
      ref: 'User',
      required: [true, 'Prescribing doctor is required'],
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.Mixed, // Patient ObjectId or String ID
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true
    },
    medicines: {
      type: [MedicineItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Prescription must contain at least one medicine'
      }
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Take medicines strictly as prescribed. Complete full course.'
    },
    dietaryAdvice: {
      type: String,
      trim: true,
      default: ''
    },
    diagnosis: {
      type: String,
      trim: true,
      default: 'Clinical Assessment'
    },
    followUpDate: {
      type: String,
      trim: true
    },
    digitalSignature: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: true
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

PrescriptionSchema.index({ patientId: 1, issuedAt: -1 });

export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
export default Prescription;
