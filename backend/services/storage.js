import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isAwsConfigured, ddbDocClient, s3ClientInstance, awsConfig } from '../config/aws.js';
import { getInitialSeedData } from '../data/seedData.js';
import { calculatePriorityScore } from './priorityScore.js';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';
const dataDir = isVercel ? os.tmpdir() : path.join(__dirname, '..', 'data');
const DB_FILE_PATH = path.join(dataDir, 'litterhero_db.json');

// Ensure data folder exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory atomic lock for transaction safety in Node
let writeLock = Promise.resolve();
function withLock(fn) {
  const nextLock = writeLock.then(fn);
  writeLock = nextLock.catch(() => {});
  return nextLock;
}

class StorageService {
  constructor() {
    this.initLocalDb();
  }

  initLocalDb() {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const seed = getInitialSeedData();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seed, null, 2), 'utf-8');
      console.log('[Storage] Local JSON store initialized with high-fidelity seed data.');
    }
  }

  readLocalDb() {
    this.initLocalDb();
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  }

  writeLocalDb(data) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- USER OPERATIONS ---
  async getUserByEmail(email) {
    const db = this.readLocalDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async getUserById(id) {
    const db = this.readLocalDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async createUser({ email, passwordHash, name, role = 'USER' }) {
    return withLock(async () => {
      const db = this.readLocalDb();
      if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email address already exists.');
      }

      // Security: citizen registration can never self-assign ADMIN role
      const sanitizedRole = role === 'ADMIN' ? 'USER' : role;

      const newUser = {
        id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: sanitizedRole,
        points: 0,
        completedCleanups: 0,
        createdAt: new Date().toISOString(),
        badges: ['Community Volunteer']
      };

      db.users.push(newUser);
      this.writeLocalDb(db);

      const { passwordHash: _, ...safeUser } = newUser;
      return safeUser;
    });
  }

  // --- REPORT OPERATIONS ---
  async getReports() {
    const db = this.readLocalDb();
    return [...db.reports].reverse();
  }

  async createReport({ title, description, category, severity, location, latitude, longitude, photoUrl, user }) {
    return withLock(async () => {
      const db = this.readLocalDb();

      const priorityInfo = calculatePriorityScore({
        severity,
        category,
        nearbyReportsCount: db.reports.filter(r => r.category === category).length,
        daysSinceReported: 0
      });

      const reportId = `rep-${Date.now()}`;
      const newReport = {
        id: reportId,
        title: title || `${category.toUpperCase()} Litter Hotspot`,
        description,
        category,
        severity,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        reportedBy: user.id,
        reportedByName: user.name,
        createdAt: new Date().toISOString(),
        status: 'OPEN',
        priorityScore: priorityInfo.score,
        priorityExplanation: priorityInfo.explanation,
        photoUrl: photoUrl || null
      };

      db.reports.push(newReport);

      // Auto-create an action mission from report
      const missionId = `msn-${Date.now()}`;
      const rewardPoints = Math.max(50, Math.round(priorityInfo.score * 1.5));

      const newMission = {
        id: missionId,
        reportId: newReport.id,
        title: `Cleanup: ${newReport.title}`,
        description: newReport.description,
        category: newReport.category,
        severity: newReport.severity,
        location: newReport.location,
        latitude: newReport.latitude,
        longitude: newReport.longitude,
        priorityScore: priorityInfo.score,
        priorityExplanation: priorityInfo.explanation,
        priorityBadge: priorityInfo.badge,
        rewardPoints,
        status: 'AVAILABLE',
        claimedBy: null,
        claimedByName: null,
        claimedAt: null,
        beforePhotoUrl: newReport.photoUrl,
        evidence: null,
        reviews: []
      };

      db.missions.push(newMission);
      db.impactStats.totalReportsSubmitted += 1;

      this.writeLocalDb(db);
      return { report: newReport, mission: newMission };
    });
  }

  // --- MISSION OPERATIONS ---
  async getMissions(filters = {}) {
    const db = this.readLocalDb();
    let missions = [...db.missions];

    if (filters.status && filters.status !== 'ALL') {
      missions = missions.filter(m => m.status === filters.status);
    }
    if (filters.category && filters.category !== 'ALL') {
      missions = missions.filter(m => m.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.severity && filters.severity !== 'ALL') {
      missions = missions.filter(m => m.severity.toLowerCase() === filters.severity.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      missions = missions.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }

    return missions.reverse();
  }

  async getMissionById(id) {
    const db = this.readLocalDb();
    return db.missions.find(m => m.id === id) || null;
  }

  async claimMission(missionId, userId, userName) {
    return withLock(async () => {
      const db = this.readLocalDb();
      const mission = db.missions.find(m => m.id === missionId);

      if (!mission) {
        throw new Error('Mission not found.');
      }

      if (mission.status !== 'AVAILABLE') {
        throw new Error(`Mission cannot be claimed. Current status is ${mission.status}.`);
      }

      mission.status = 'CLAIMED';
      mission.claimedBy = userId;
      mission.claimedByName = userName;
      mission.claimedAt = new Date().toISOString();

      this.writeLocalDb(db);
      return mission;
    });
  }

  async submitEvidence(missionId, userId, { afterPhotoUrl, notes, estimatedWasteKg, bagsCollected }) {
    return withLock(async () => {
      const db = this.readLocalDb();
      const mission = db.missions.find(m => m.id === missionId);

      if (!mission) {
        throw new Error('Mission not found.');
      }

      if (mission.claimedBy !== userId) {
        throw new Error('Forbidden: You can only submit cleanup evidence for missions you claimed.');
      }

      if (mission.status !== 'CLAIMED' && mission.status !== 'REJECTED') {
        throw new Error(`Cannot submit evidence. Mission status is ${mission.status}.`);
      }

      if (!afterPhotoUrl) {
        throw new Error('After-cleanup evidence photo is required.');
      }

      // SUBMITTING EVIDENCE DOES NOT AWARD POINTS!
      // Transitions to PENDING_REVIEW for strict admin verification.
      mission.status = 'PENDING_REVIEW';
      mission.evidence = {
        submittedAt: new Date().toISOString(),
        submittedBy: userId,
        afterPhotoUrl,
        notes: notes || 'Cleanup completed by volunteer hero.',
        estimatedWasteKg: Number(estimatedWasteKg) || 10,
        bagsCollected: Number(bagsCollected) || 1,
        reviewStatus: 'PENDING_REVIEW',
        rejectionReason: null
      };

      this.writeLocalDb(db);
      return mission;
    });
  }

  // --- ADMIN VERIFICATION & IDEMPOTENT REWARD OPERATIONS ---
  async reviewEvidence(missionId, adminUser, { decision, rejectionReason, notes }) {
    return withLock(async () => {
      const db = this.readLocalDb();
      const mission = db.missions.find(m => m.id === missionId);

      if (!mission) {
        throw new Error('Mission not found.');
      }

      if (!mission.evidence) {
        throw new Error('No cleanup evidence has been submitted for this mission.');
      }

      // IDEMPOTENCY / DUPLICATE PREVENTION RULE:
      // If already approved, prevent duplicate execution and reward payout!
      if (mission.status === 'APPROVED' || mission.evidence.reviewStatus === 'APPROVED') {
        throw new Error('Conflict: This mission has already been approved and rewarded. Duplicate payouts are blocked.');
      }

      const reviewRecord = {
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminUser.userId || adminUser.id,
        reviewerName: adminUser.name || 'Admin Reviewer',
        decision,
        notes: notes || ''
      };

      if (decision === 'APPROVED') {
        mission.status = 'APPROVED';
        mission.evidence.reviewStatus = 'APPROVED';
        mission.evidence.rejectionReason = null;
        reviewRecord.awardedPoints = mission.rewardPoints;

        // Atomically award points to the claimer
        const claimer = db.users.find(u => u.id === mission.claimedBy);
        if (claimer) {
          claimer.points = (claimer.points || 0) + mission.rewardPoints;
          claimer.completedCleanups = (claimer.completedCleanups || 0) + 1;

          // Check & unlock badges
          if (claimer.completedCleanups >= 5 && !claimer.badges.includes('Eco Champion')) {
            claimer.badges.push('Eco Champion');
          }
          if (claimer.points >= 500 && !claimer.badges.includes('Zero Waste Vanguard')) {
            claimer.badges.push('Zero Waste Vanguard');
          }
        }

        // Update platform impact stats
        db.impactStats.verifiedCleanupsCompleted += 1;
        db.impactStats.estimatedWasteCollectedKg += (mission.evidence.estimatedWasteKg || 10);
        db.impactStats.bagsCollected += (mission.evidence.bagsCollected || 1);
        db.impactStats.verifiedPointsAwarded += mission.rewardPoints;

        // Log audit trail
        db.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: adminUser.userId || adminUser.id,
          actorName: adminUser.name,
          action: 'VERIFY_EVIDENCE_APPROVED',
          targetId: mission.id,
          details: `Approved mission "${mission.title}". ${mission.rewardPoints} points credited to ${mission.claimedByName}.`
        });
      } else if (decision === 'REJECTED') {
        if (!rejectionReason || !rejectionReason.trim()) {
          throw new Error('A rejection reason must be provided to the volunteer.');
        }

        mission.status = 'REJECTED';
        mission.evidence.reviewStatus = 'REJECTED';
        mission.evidence.rejectionReason = rejectionReason.trim();
        reviewRecord.rejectionReason = rejectionReason.trim();

        // Log audit trail
        db.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: adminUser.userId || adminUser.id,
          actorName: adminUser.name,
          action: 'VERIFY_EVIDENCE_REJECTED',
          targetId: mission.id,
          details: `Rejected mission "${mission.title}". Reason: ${rejectionReason}`
        });
      } else {
        throw new Error('Invalid review decision. Must be APPROVED or REJECTED.');
      }

      mission.reviews.push(reviewRecord);
      this.writeLocalDb(db);
      return mission;
    });
  }

  // --- LEADERBOARD & METRICS ---
  async getLeaderboard() {
    const db = this.readLocalDb();
    const userRanking = db.users
      .filter(u => u.role === 'USER')
      .map(u => ({
        id: u.id,
        name: u.name,
        points: u.points || 0,
        completedCleanups: u.completedCleanups || 0,
        badges: u.badges || [],
        joinedAt: u.createdAt
      }))
      .sort((a, b) => b.points - a.points);

    return userRanking;
  }

  async getImpactStats() {
    const db = this.readLocalDb();
    return {
      ...db.impactStats,
      activeMissions: db.missions.filter(m => m.status === 'AVAILABLE').length,
      pendingVerification: db.missions.filter(m => m.status === 'PENDING_REVIEW').length
    };
  }

  async getAuditLogs() {
    const db = this.readLocalDb();
    return db.auditLogs || [];
  }
}

export const storage = new StorageService();
