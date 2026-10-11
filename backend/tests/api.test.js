import test from 'node:test';
import assert from 'node:assert';
import { storage } from '../services/storage.js';
import { hashPassword, comparePassword, createToken } from '../middleware/auth.js';
import { calculatePriorityScore } from '../services/priorityScore.js';

test('LitterHero Security & Business Logic Verification', async (t) => {
  await t.test('1. Password Hashing and JWT Token Generation', () => {
    const rawPass = 'EcoHeroSecure2026!';
    const hash = hashPassword(rawPass);
    assert.strictEqual(comparePassword(rawPass, hash), true, 'Password verification must succeed');
    assert.strictEqual(comparePassword('wrong-password', hash), false, 'Wrong password must fail');

    const token = createToken({ id: 'usr-123', email: 'test@hero.org', name: 'Tester', role: 'USER' });
    assert.ok(typeof token === 'string' && token.length > 20, 'JWT token must be non-empty string');
  });

  await t.test('2. Explainable Priority Score Heuristic', () => {
    const highRisk = calculatePriorityScore({
      severity: 'critical',
      category: 'hazardous',
      nearbyReportsCount: 3,
      daysSinceReported: 2
    });

    assert.ok(highRisk.score >= 75, 'Critical + Hazardous must score in critical priority range');
    assert.strictEqual(highRisk.badge, 'Critical Priority');
    assert.ok(highRisk.explanation.includes('CRITICAL'), 'Explanation must include severity reason');
    assert.ok(highRisk.explanation.includes('HAZARDOUS'), 'Explanation must include category reason');

    const lowRisk = calculatePriorityScore({
      severity: 'low',
      category: 'paper',
      nearbyReportsCount: 0,
      daysSinceReported: 0
    });

    assert.ok(lowRisk.score < 50, 'Low severity paper must score moderate or standard');
  });

  await t.test('3. Complete Verified Impact Loop (Report -> Claim -> Evidence -> Review -> Reward)', async () => {
    // A. Create unique user
    const uniqueEmail = `testuser_${Date.now()}@test.org`;
    const user = await storage.createUser({
      email: uniqueEmail,
      passwordHash: hashPassword('Pass123!'),
      name: 'Integration Test User',
      role: 'USER'
    });

    const initialPoints = user.points || 0;
    assert.strictEqual(initialPoints, 0, 'New user starts with 0 verified points');

    // B. Create Report
    const { report, mission } = await storage.createReport({
      title: 'Automated Test Debris',
      description: 'Test debris along riverbank',
      category: 'plastic',
      severity: 'high',
      location: 'Integration Test Park',
      user: { id: user.id, name: user.name }
    });

    assert.ok(report.id.startsWith('rep-'), 'Report ID must be generated');
    assert.ok(mission.id.startsWith('msn-'), 'Mission ID must be generated');
    assert.strictEqual(mission.status, 'AVAILABLE', 'New mission must be AVAILABLE');

    // C. Claim Mission
    const claimed = await storage.claimMission(mission.id, user.id, user.name);
    assert.strictEqual(claimed.status, 'CLAIMED', 'Mission must be CLAIMED');
    assert.strictEqual(claimed.claimedBy, user.id);

    // D. Prevent Duplicate Claim
    await assert.rejects(
      async () => storage.claimMission(mission.id, 'other-user', 'Other'),
      /cannot be claimed/i,
      'Duplicate claim on already claimed mission must be rejected'
    );

    // E. Submit Evidence (MUST NOT award points yet!)
    const evidenceSubmitted = await storage.submitEvidence(mission.id, user.id, {
      afterPhotoUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      notes: 'Cleaned all plastic containers',
      estimatedWasteKg: 15,
      bagsCollected: 2
    });

    assert.strictEqual(evidenceSubmitted.status, 'PENDING_REVIEW', 'Status must transition to PENDING_REVIEW');
    assert.strictEqual(evidenceSubmitted.evidence.reviewStatus, 'PENDING_REVIEW');

    // Verify user points STILL 0 (evidence submission alone earns NO points)
    const profileBeforeReview = await storage.getUserById(user.id);
    assert.strictEqual(profileBeforeReview.points, 0, 'No points awarded before admin verification!');

    // F. Admin Verification & Approval
    const adminUser = { userId: 'usr-admin-001', name: 'Marcus Vance', role: 'ADMIN' };
    const reviewed = await storage.reviewEvidence(mission.id, adminUser, {
      decision: 'APPROVED',
      notes: 'Excellent verifiable cleanup.'
    });

    assert.strictEqual(reviewed.status, 'APPROVED', 'Mission must be marked APPROVED');

    // Verify points ARE now awarded to volunteer
    const profileAfterReview = await storage.getUserById(user.id);
    assert.strictEqual(profileAfterReview.points, mission.rewardPoints, 'Points must be credited upon approval');
    assert.strictEqual(profileAfterReview.completedCleanups, 1, 'Cleanups counter must increment');

    // G. Duplicate-Proof Reward Test (Idempotency)
    // Attempting to review/approve again MUST fail and not award duplicate points
    await assert.rejects(
      async () => storage.reviewEvidence(mission.id, adminUser, { decision: 'APPROVED' }),
      /already been approved/i,
      'Duplicate approval attempt must fail to prevent double reward payout'
    );

    const profileAfterDuplicateAttempt = await storage.getUserById(user.id);
    assert.strictEqual(
      profileAfterDuplicateAttempt.points,
      mission.rewardPoints,
      'User points must NOT increase on duplicate review attempt'
    );
  });

  await t.test('4. Rejection Handling without Points Awarded', async () => {
    const user = await storage.createUser({
      email: `reject_test_${Date.now()}@test.org`,
      passwordHash: hashPassword('Pass123!'),
      name: 'Rejection Test User',
      role: 'USER'
    });

    const { mission } = await storage.createReport({
      title: 'Reject Debris',
      description: 'Needs test',
      category: 'paper',
      severity: 'low',
      location: 'Test Location',
      user: { id: user.id, name: user.name }
    });

    await storage.claimMission(mission.id, user.id, user.name);
    await storage.submitEvidence(mission.id, user.id, {
      afterPhotoUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      notes: 'Did a partial sweep',
      estimatedWasteKg: 2,
      bagsCollected: 1
    });

    const adminUser = { userId: 'usr-admin-001', name: 'Marcus Vance', role: 'ADMIN' };

    // Rejection without reason must fail
    await assert.rejects(
      async () => storage.reviewEvidence(mission.id, adminUser, { decision: 'REJECTED', rejectionReason: '' }),
      /rejection reason must be provided/i,
      'Rejection must require explanation'
    );

    // Valid rejection
    const rejected = await storage.reviewEvidence(mission.id, adminUser, {
      decision: 'REJECTED',
      rejectionReason: 'After photo is too blurry to verify cleanup completion.'
    });

    assert.strictEqual(rejected.status, 'REJECTED');
    assert.strictEqual(rejected.evidence.rejectionReason, 'After photo is too blurry to verify cleanup completion.');

    const userProfile = await storage.getUserById(user.id);
    assert.strictEqual(userProfile.points, 0, 'Rejected evidence must not award points');
  });
});
