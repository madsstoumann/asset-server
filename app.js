import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import assetRoutes from './routes/assetRoutes.js';
import { imageResizeMiddleware } from './middleware/imageResize.js';

// Configure dotenv first thing to ensure all env vars are loaded
dotenv.config();

// Confirm env vars are available
console.log('App configuration:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- ALLOWED_TAGS:', process.env.ALLOWED_TAGS);
console.log('- ALLOWED_WIDTHS:', process.env.ALLOWED_WIDTHS);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8080', 'http://localhost:5500'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Important: Apply image resize middleware BEFORE static middleware
// This ensures resize requests are handled before serving static files
console.log('Setting up image resize middleware for path: /assets');
app.use('/assets', imageResizeMiddleware);

// After the resize middleware, serve static files for unprocessed requests
console.log('Setting up static file serving for path: /assets');
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/api', assetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export app instead of starting server here
export default app;
