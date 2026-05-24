const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const programRoutes = require('./routes/programRoutes');
const topicRoutes = require('./routes/topicRoutes');
const trainingMethodRoutes = require('./routes/trainingMethodRoutes');
const trainingScenarioRoutes = require('./routes/trainingScenarioRoutes');
const classRoutes = require('./routes/classRoutes');
const plannedClassRoutes = require('./routes/plannedClassRoutes');
const reportRoutes = require('./routes/reportRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const membersRoutes = require('./routes/membersRoutes');
const usersRoutes = require('./routes/usersRoutes');
const meRoutes = require('./routes/meRoutes');
const entrySetupExampleRoutes = require('./routes/entrySetupExampleRoutes');
const billingRoutes = require('./routes/billingRoutes');
const billingWebhookRoutes = require('./routes/billingWebhookRoutes');
const { logServerError, sendClientError, sendServerError } = require('./middleware/errorHandler');
const {
  isStripeConfigured,
  validateStripeRuntimeMode,
  getStripeRuntimeSummary
} = require('./services/stripeService');

const app = express();

const normalizeBooleanEnv = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return null;
};

const stripeRuntimeSummary = getStripeRuntimeSummary();

if (isStripeConfigured() || stripeRuntimeSummary.stripeMode === 'live' || stripeRuntimeSummary.invalidMode) {
  try {
    validateStripeRuntimeMode();
  } catch (error) {
    console.warn('Stripe billing configuration warning:', {
      message: error.message,
      stripeMode: stripeRuntimeSummary.stripeMode,
      keyType: stripeRuntimeSummary.keyType,
      nodeEnv: stripeRuntimeSummary.nodeEnv,
      billingEnforcementExplicitlyDisabled: stripeRuntimeSummary.billingEnforcementExplicitlyDisabled
    });
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const trustProxyOverride = normalizeBooleanEnv(process.env.TRUST_PROXY);
const trustProxyEnabled = trustProxyOverride === null ? isProduction : trustProxyOverride;

app.set('trust proxy', trustProxyEnabled ? 1 : false);

const configuredOrigins = (
  process.env.ALLOWED_ORIGINS
  || process.env.CORS_ORIGIN
  || process.env.CLIENT_URL
  || ''
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOriginsForLocalDev = !isProduction && configuredOrigins.length === 0;

const buildCorsError = () => {
  const error = new Error('Origin not allowed');
  error.statusCode = 403;
  error.isCorsError = true;
  return error;
};

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowAllOriginsForLocalDev || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(buildCorsError());
  }
}));
app.use('/api/billing/webhook', billingWebhookRoutes);
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');

    res.status(200).json({
      message: 'API is running',
      database: rows[0].ok === 1 ? 'connected' : 'not connected'
    });
  } catch (error) {
    logServerError('Health check error:', error);

    res.status(503).json({
      message: 'API is running',
      database: 'unavailable'
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/training-methods', trainingMethodRoutes);
app.use('/api/training-scenarios', trainingScenarioRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/planned-classes', plannedClassRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/me', meRoutes);
app.use('/api/entry-setup-examples', entrySetupExampleRoutes);
app.use('/api/billing', billingRoutes);

app.use((req, res) => sendClientError(res, {
  status: 404,
  message: 'Route not found'
}));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.isCorsError || err?.statusCode === 403) {
    return sendClientError(res, {
      status: 403,
      message: 'Origin not allowed'
    });
  }

  logServerError('Unhandled request error:', err);
  return sendServerError(res);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
