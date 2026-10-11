import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

import { storage } from './services/storage.js';
import {
  hashPassword,
  comparePassword,
  createToken,
  authenticateUser,
  requireAdmin
} from './middleware/auth.js';
import { isAwsConfigured, awsConfig } from './config/aws.js';

import os from 'os';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' }));

// Ensure uploads folder exists (using os.tmpdir on serverless platforms)
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage setup for local file uploads
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `litterhero-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg\+xml/;
    if (allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file format. Allowed: JPG, PNG, WEBP.'));
    }
  }
});

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    product: 'LitterHero',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aws: {
      configured: isAwsConfigured,
      mode: isAwsConfigured ? 'AWS_CLOUD_INTEGRATED' : 'LOCAL_PERSISTENT_HIGH_FIDELITY',
      region: awsConfig.region,
      s3Bucket: awsConfig.s3BucketName,
      dynamoTables: {
        reports: awsConfig.reportsTableName,
        missions: awsConfig.missionsTableName
      }
    }
  });
});

// ==========================================
// 2. AUTHENTICATION (USER & ADMIN)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const passwordHash = hashPassword(password);
    const user = await storage.createUser({ email, passwordHash, name, role: 'USER' });
    const token = createToken(user);

    res.status(201).json({
      message: 'Registration successful! Welcome to LitterHero.',
      token,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = createToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Server authentication failure: ' + err.message });
  }
});

app.get('/api/auth/me', authenticateUser, async (req, res) => {
  try {
    const user = await storage.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. FILE / MEDIA UPLOAD
// ==========================================
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({
    message: 'Image uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// ==========================================
// 4. LITTER REPORTS
// ==========================================
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await storage.getReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', authenticateUser, async (req, res) => {
  try {
    const { title, description, category, severity, location, latitude, longitude, photoUrl } = req.body;
    
    if (!category || !severity || !location) {
      return res.status(400).json({
        error: 'Missing required report fields: category, severity, and location are mandatory.'
      });
    }

    const result = await storage.createReport({
      title,
      description: description || `Reported ${category} hotspot at ${location}`,
      category,
      severity,
      location,
      latitude,
      longitude,
      photoUrl,
      user: {
        id: req.user.userId,
        name: req.user.name
      }
    });

    res.status(201).json({
      message: 'Litter hotspot reported successfully and registered as active cleanup mission!',
      report: result.report,
      mission: result.mission
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. CLEANUP MISSIONS
// ==========================================
app.get('/api/missions', async (req, res) => {
  try {
    const { status, category, severity, search } = req.query;
    const missions = await storage.getMissions({ status, category, severity, search });
    res.json(missions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/missions/:id', async (req, res) => {
  try {
    const mission = await storage.getMissionById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found.' });
    }
    res.json(mission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User claims a mission
app.post('/api/missions/:id/claim', authenticateUser, async (req, res) => {
  try {
    const mission = await storage.claimMission(req.params.id, req.user.userId, req.user.name);
    res.json({
      message: `Mission "${mission.title}" successfully claimed! Go make an impact!`,
      mission
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User submits cleanup evidence -> Enters PENDING_REVIEW. NO points awarded yet!
app.post('/api/missions/:id/evidence', authenticateUser, async (req, res) => {
  try {
    const { afterPhotoUrl, notes, estimatedWasteKg, bagsCollected } = req.body;
    const mission = await storage.submitEvidence(req.params.id, req.user.userId, {
      afterPhotoUrl,
      notes,
      estimatedWasteKg,
      bagsCollected
    });

    res.json({
      message: 'Evidence submitted successfully! Status is now Pending Review. Verified points will be credited after admin approval.',
      mission
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. ADMIN VERIFICATION PORTAL (PROTECTED)
// ==========================================
// Strict verification: citizen account gets HTTP 403
app.get('/api/admin/reviews', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const missions = await storage.getMissions();
    const pendingReviews = missions.filter(m => m.status === 'PENDING_REVIEW');
    const allReviewed = missions.filter(m => m.status === 'APPROVED' || m.status === 'REJECTED');

    res.json({
      pending: pendingReviews,
      history: allReviewed,
      pendingCount: pendingReviews.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reviews evidence: Approve (awards points idempotently) or Reject (with mandatory reason)
app.post('/api/admin/missions/:id/review', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { decision, rejectionReason, notes } = req.body;
    if (!decision || (decision !== 'APPROVED' && decision !== 'REJECTED')) {
      return res.status(400).json({ error: 'Review decision must be APPROVED or REJECTED.' });
    }

    const mission = await storage.reviewEvidence(req.params.id, req.user, {
      decision,
      rejectionReason,
      notes
    });

    res.json({
      message: decision === 'APPROVED'
        ? `Evidence verified and approved! ${mission.rewardPoints} points credited to volunteer.`
        : `Evidence rejected. Rejection reason recorded and communicated.`,
      mission
    });
  } catch (err) {
    // Return 409 Conflict if trying to approve already approved mission
    if (err.message.includes('already been approved') || err.message.includes('Conflict')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

// Admin moderation audit logs
app.get('/api/admin/audit-logs', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. LEADERBOARD & IMPACT
// ==========================================
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/impact', async (req, res) => {
  try {
    const impact = await storage.getImpactStats();
    res.json(impact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Backend Error]', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

// Start server if not running as serverless function
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 LitterHero API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/status`);
    console.log(`🔒 Security Boundary: USER vs ADMIN strictly enforced`);
    console.log(`=================================================`);
  });
}

export default app;
