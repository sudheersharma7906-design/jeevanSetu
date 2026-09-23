// server/modules/user/user.service.js
import { db } from '../../data/db.js';
import { ROLES, calculateHaversineDistance } from '../../config/constants.js';
import { User } from '../../models/User.js';

export class UserService {
  static async getUserById(id) {
    if (!id) throw new Error('User ID is required');
    try {
      const user = await User.findById(id);
      if (user) {
        const obj = user.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    const user = db.findUserById(id);
    if (!user) {
      throw new Error(`User with ID '${id}' not found.`);
    }
    return user;
  }

  static async getPatientById(id) {
    if (!id) throw new Error('Patient ID is required');
    try {
      const user = await User.findById(id);
      if (user && (user.role === ROLES.PATIENT || user.role === 'patient')) {
        const obj = user.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    const user = db.findUserById(id);
    if (!user || (user.role !== ROLES.PATIENT && user.role !== 'patient')) {
      throw new Error(`Patient with ID '${id}' not found.`);
    }
    return user;
  }

  static async updateUserProfile(id, updates) {
    try {
      const updated = await User.findByIdAndUpdate(id, updates, { new: true });
      if (updated) {
        const obj = updated.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    const existing = db.findUserById(id);
    if (!existing) {
      throw new Error(`User with ID '${id}' not found.`);
    }
    return db.updateUser(id, updates);
  }

  static async updateUserLocation(id, { latitude, longitude, address }) {
    if (latitude == null || longitude == null) {
      throw new Error('Valid latitude and longitude are required.');
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    try {
      const updated = await User.findByIdAndUpdate(id, {
        location: {
          type: 'Point',
          coordinates: [lng, lat],
          address: address || 'Updated Live GPS Location'
        }
      }, { new: true });

      if (updated) {
        const obj = updated.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    return db.updateUser(id, {
      location: {
        latitude: lat,
        longitude: lng,
        address: address || 'Updated Live GPS Location'
      }
    });
  }

  static async getNearbyRmps(latitude, longitude, maxDistanceKm = 30) {
    const lat = parseFloat(latitude) || 19.6542;
    const lon = parseFloat(longitude) || 73.1389;

    try {
      const rmps = await User.findNearestRmps(lon, lat, maxDistanceKm * 1000);
      if (rmps && rmps.length > 0) {
        return rmps.map(r => {
          const obj = r.toObject();
          const rLat = r.location?.coordinates ? r.location.coordinates[1] : lat;
          const rLng = r.location?.coordinates ? r.location.coordinates[0] : lon;
          const dist = calculateHaversineDistance(lat, lon, rLat, rLng);
          return {
            ...obj,
            id: obj._id ? obj._id.toString() : obj.id,
            distanceKm: parseFloat(dist.toFixed(1))
          };
        });
      }
    } catch (e) {}

    return db.getNearbyRmps(lat, lon, maxDistanceKm);
  }

  static async getDoctors(specialty = '') {
    try {
      const query = { role: ROLES.DOCTOR };
      if (specialty) {
        query.specialty = { $regex: specialty, $options: 'i' };
      }
      const docs = await User.find(query);
      if (docs && docs.length > 0) {
        return docs.map(d => {
          const obj = d.toObject();
          return { ...obj, id: obj._id.toString() };
        });
      }
    } catch (e) {}

    let doctors = db.getAllUsers().filter(u => u.role === ROLES.DOCTOR);
    if (specialty) {
      doctors = doctors.filter(d => d.specialty?.toLowerCase().includes(specialty.toLowerCase()));
    }
    return doctors;
  }

  static async toggleRmpStatus(rmpId, status) {
    const validStatuses = ['ONLINE', 'BUSY', 'OFFLINE', 'online', 'busy', 'offline', 'available'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const updated = await User.findByIdAndUpdate(rmpId, { status: status.toLowerCase() }, { new: true });
      if (updated) {
        const obj = updated.toObject();
        obj.id = obj._id.toString();
        return obj;
      }
    } catch (e) {}

    const rmp = db.findUserById(rmpId);
    if (!rmp || rmp.role !== ROLES.RMP) {
      throw new Error('RMP not found.');
    }
    return db.updateUser(rmpId, { status });
  }

  static async getAllPatients() {
    try {
      const patients = await User.find({ role: ROLES.PATIENT });
      if (patients && patients.length > 0) {
        return patients.map(p => {
          const obj = p.toObject();
          return { ...obj, id: obj._id.toString() };
        });
      }
    } catch (e) {}

    return db.getAllUsers().filter(u => u.role === ROLES.PATIENT);
  }
}
