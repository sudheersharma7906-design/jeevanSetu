// server/models/User.js
import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';

const PointSchema = new mongoose.Schema(
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
        message: 'Coordinates must be valid [longitude, latitude] within valid geographic ranges'
      }
    },
    address: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['patient', 'rmp', 'doctor', 'admin'],
      required: [true, 'User role is required'],
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      trim: true
    },
    passwordHash: {
      type: String,
      trim: true
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    block: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: 'Palghar'
    },
    state: {
      type: String,
      trim: true,
      default: 'Maharashtra'
    },
    language: {
      type: String,
      enum: ['hi', 'mr', 'en'],
      default: 'hi'
    },
    location: {
      type: PointSchema,
      required: true
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'busy', 'available'],
      default: 'online',
      lowercase: true,
      index: true
    },

    // Patient-specific fields
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    abhaId: { type: String, trim: true },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
    },

    // RMP / Doctor-specific fields
    regNumber: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    hospital: { type: String, trim: true },
    specialty: { type: String, trim: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    totalConsults: { type: Number, default: 0 },
    emergencyTrained: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.passwordHash = await bcrypt.hash(this.password, 10);
  }
});

// Compare entered password with stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.passwordHash) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  }
  if (this.password) {
    return candidatePassword === this.password;
  }
  return false;
};

// 2dsphere index on location — required for nearest-RMP geo queries
UserSchema.index({ location: '2dsphere' });
// Compound index for role-status filtering
UserSchema.index({ role: 1, status: 1 });

/**
 * Static method to find nearest active RMPs using native MongoDB $near
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} maxDistanceMeters - Radius in meters (default: 30000 = 30km)
 */
UserSchema.statics.findNearestRmps = function (lng, lat, maxDistanceMeters = 30000) {
  return this.find({
    role: 'rmp',
    status: { $in: ['online', 'available'] },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  });
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
