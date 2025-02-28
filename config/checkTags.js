import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory of current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

console.log('\n--- Environment Variables Check ---');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('ALLOWED_TAGS env variable:', process.env.ALLOWED_TAGS || 'Not set');

// Parse and verify the allowed tags
const allowedTags = process.env.ALLOWED_TAGS
  ? process.env.ALLOWED_TAGS.split(',').map(tag => tag.trim())
  : [];

console.log('Parsed allowed tags:', allowedTags);
console.log('Number of allowed tags:', allowedTags.length);

// Check if .env file exists and what it contains
const envPath = path.join(rootDir, '.env');
console.log('\n--- .env File Check ---');

if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Found .env file. Content:');
    
    // Print only the ALLOWED_TAGS line for security
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('ALLOWED_TAGS=')) {
        console.log(line.trim());
      }
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
} else {
  console.log('No .env file found at:', envPath);
  
  // Check if there's a .env.example file
  const examplePath = path.join(rootDir, '.env.example');
  if (fs.existsSync(examplePath)) {
    console.log('Found .env.example file. You should copy this to .env');
  }
}

console.log('\n--- How to Fix ---');
console.log('Make sure your .env file exists and has this line:');
console.log('ALLOWED_TAGS=front,back,inside,spine');
console.log('\nAfter fixing, restart your server.');
