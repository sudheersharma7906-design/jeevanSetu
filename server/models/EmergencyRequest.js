// server/models/EmergencyRequest.js
import mongoose from 'mongoose';

const EmergencyLocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (coords) {
          return Array.isArray(coords) && coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 && // longitude
            coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    },
    source: {
      type: String,
      enum: ['gps', 'registered_address'],
      default: 'gps'
    },
    address: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const EscalationEntrySchema = new mongoose.Schema(
  {
    tier: {
      type: Number,
      enum: [1, 2, 3], // 1: Local RMP, 2: District Hospital, 3: 108 Ambulance
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      default: 'ESCALATED'
    }
  },
  { _id: false }
);

const EmergencyTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const EmergencyRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed, // Patient ObjectId or String ID
      ref: 'User',
      required: [true, 'Patient ID is required for emergency dispatch'],
      index: true
    },
    patientName: {
      type: String,
      trim: true,
      default: 'Emergency Patient'
    },
    patientPhone: {
      type: String,
      trim: true
    },
    triggerType: {
      type: String,
      enum: ['button', 'voice', 'BUTTON', 'VOICE'],
      required: true,
      lowercase: true
    },
    keywordMatched: {
      type: String,
      trim: true,
      default: ''
    },
    voiceTranscript: {
      type: String,
      trim: true,
      default: ''
    },
    symptoms: {
      type: String,
      trim: true,
      default: 'Critical Emergency'
    },
    location: {
      type: EmergencyLocationSchema,
      required: true
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'escalated',
        'resolved',
        'cancelled',
        'triggered',
        'notified',
        'en_route',
        'arrived'
      ],
      default: 'pending',
      lowercase: true,
      index: true
    },
    tier: {
      type: Number,
      enum: [1, 2, 3],
      default: 1
    },
    assignedRmpId: {
      type: mongoose.Schema.Types.Mixed, // RMP User ObjectId or String ID
      ref: 'User',
      default: null,
      index: true
    },
    matchedRmp: {
      id: { type: String },
      name: { type: String },
      phone: { type: String },
      distanceKm: { type: Number },
      clinicName: { type: String }
    },
    responseTimeSeconds: {
      type: Number,
      default: null
    },
    escalationHistory: {
      type: [EscalationEntrySchema],
      default: []
    },
    timeline: {
      type: [EmergencyTimelineSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index on location for radius search
EmergencyRequestSchema.index({ location: '2dsphere' });
// Compound index for active emergency tracking
EmergencyRequestSchema.index({ status: 1, createdAt: -1 });

export const EmergencyRequest = mongoose.models.EmergencyRequest || mongoose.model('EmergencyRequest', EmergencyRequestSchema);
export default EmergencyRequest;
