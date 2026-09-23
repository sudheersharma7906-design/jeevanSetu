// scripts/dev.js
import { spawn } from 'child_process';

console.log('\n=======================================================');
console.log(' 🏥 Starting JivanSetu Full-Stack App (Backend + Frontend)');
console.log('=======================================================\n');

// 1. Launch Backend REST & Socket Server (port 5000)
const server = spawn('node --watch server/index.js', {
  stdio: 'inherit',
  shell: true
});

// 2. Launch Vite Frontend Dev Server (port 5173 / 3000)
const client = spawn('npx vite', {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  try {
    server.kill();
    client.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
