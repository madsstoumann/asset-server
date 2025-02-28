// Load environment variables first thing
import dotenv from 'dotenv';
dotenv.config();

console.log('===============================');
console.log('SERVER STARTUP');
console.log('===============================');
console.log('Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ALLOWED_TAGS:', process.env.ALLOWED_TAGS);
console.log('===============================');

// Then import and start the app
import app from './app.js';

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
