// server/data/seeds.js
import { seedUsers } from '../scripts/seedMongo.js';

export const initialUsers = seedUsers.map((u, idx) => ({ ...u, id: `pat-${101 + idx}` }));
export const initialRecords = [];
export const initialPrescriptions = [];
export const initialConsultQueue = [];
export const initialEmergencies = [];
