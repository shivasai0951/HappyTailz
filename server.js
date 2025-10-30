const express = require('express');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const connectDB = require('./config/db');
// nodemon: trigger reload on env change
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger.json');

// Routers
const baseRouter = require('./routes');
const authRouter = require('./routes/auth');
const petsRouter = require('./routes/pets');
const walkingRequestsRouter = require('./routes/walkingRequests');
const userDashboardRouter = require('./routes/dashboard');
const profileRouter = require('./routes/profile');
const adminBreedingRouter = require('./routes/admin/breeding');
const adminHospitalsRouter = require('./routes/admin/hospitals');
const adminGroomingRouter = require('./routes/admin/grooming');
const adminPlansRouter = require('./routes/admin/plans');
const adminUsersRouter = require('./routes/admin/users');
const adminDashboardRouter = require('./routes/admin/dashboard');
const publicHospitalsRouter = require('./routes/hospitals');
const publicGroomingRouter = require('./routes/grooming');
const publicBreedingRouter = require('./routes/breeding');
const publicPlansRouter = require('./routes/plans');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));


// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HappyTailz API!',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// API routes
app.use('/api', baseRouter);
app.use('/api/auth', authRouter);
app.use('/api/pets', petsRouter);
app.use('/api/dashboard', userDashboardRouter);
app.use('/api/profile', profileRouter);
app.use('/api/walkingrequests', walkingRequestsRouter);
// Public listing routes
app.use('/api/hospitals', publicHospitalsRouter);
app.use('/api/grooming', publicGroomingRouter);
app.use('/api/breeding', publicBreedingRouter);
app.use('/api/plans', publicPlansRouter);
app.use('/api/admin/breeding', adminBreedingRouter);
app.use('/api/admin/hospitals', adminHospitalsRouter);
app.use('/api/admin/grooming', adminGroomingRouter);
app.use('/api/admin/plans', adminPlansRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Connect DB then start server
const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  });
};

start();

module.exports = app;
