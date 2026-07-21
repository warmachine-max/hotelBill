import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';
import kotRoutes from './routes/kotRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/kot', kotRoutes);
// app.use('/api/orders', orderRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Hotel Billing API is running smoothly!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});