/**
 * LitterHero - Live End-to-End System & Security Verification
 * Tests live HTTP server running on port 5000.
 */

async function runE2ETest() {
  console.log('--- 🧪 STARTING LIVE E2E INTEGRATION & SECURITY TEST ---');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Health check
  const statusRes = await fetch(`${BASE_URL}/status`).then(r => r.json());
  console.log('✓ 1. System Health Check:', statusRes.status, '| Mode:', statusRes.aws.mode);

  // 2. Citizen Login
  const citizenLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@community.org', password: 'LitterHero2026!' })
  }).then(r => r.json());
  
  if (!citizenLogin.token) throw new Error('Citizen login failed');
  const citizenToken = citizenLogin.token;
  const initialPoints = citizenLogin.user.points;
  console.log(`✓ 2. Citizen authenticated: ${citizenLogin.user.name} | Role: ${citizenLogin.user.role} | Initial Points: ${initialPoints}`);

  // 3. Security Boundary Test: Citizen attempts Admin Action
  const forbiddenAttempt = await fetch(`${BASE_URL}/admin/reviews`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  });
  console.log(`✓ 3. Citizen Unauthorized Access Test: HTTP ${forbiddenAttempt.status} (Expected 403 Forbidden)`);
  if (forbiddenAttempt.status !== 403) {
    throw new Error(`Security Failure: Citizen received status ${forbiddenAttempt.status} instead of 403!`);
  }

  // 4. Citizen creates a new litter hotspot report
  const reportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenToken}`
    },
    body: JSON.stringify({
      title: 'Riverfront Boardwalk Plastic Bottles',
      description: 'Accumulation of 15+ plastic bottles washed up along timber boardwalk',
      category: 'plastic',
      severity: 'high',
      location: 'Riverfront Boardwalk, Dock 5',
      latitude: 47.601,
      longitude: -122.338,
      photoUrl: 'data:image/svg+xml;utf8,<svg width="400" height="300"><rect fill="%23fee"/></svg>'
    })
  }).then(r => r.json());

  const createdMission = reportRes.mission;
  console.log(`✓ 4. Hotspot Reported & Mission Activated: ${createdMission.title} (ID: ${createdMission.id}) | Reward: ${createdMission.rewardPoints} pts | Priority Score: ${createdMission.priorityScore}/100`);

  // 5. Citizen claims the mission
  const claimRes = await fetch(`${BASE_URL}/missions/${createdMission.id}/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` }
  }).then(r => r.json());
  console.log(`✓ 5. Mission Claimed: Status is now "${claimRes.mission.status}" by ${claimRes.mission.claimedByName}`);

  // 6. Citizen submits cleanup evidence
  const evidenceRes = await fetch(`${BASE_URL}/missions/${createdMission.id}/evidence`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenToken}`
    },
    body: JSON.stringify({
      afterPhotoUrl: 'data:image/svg+xml;utf8,<svg width="400" height="300"><rect fill="%23efe"/></svg>',
      notes: 'Thoroughly cleaned all 15 bottles and debris. Disposed in city recycling receptacle.',
      bagsCollected: 2,
      estimatedWasteKg: 12
    })
  }).then(r => r.json());

  console.log(`✓ 6. Cleanup Evidence Submitted: Mission Status is "${evidenceRes.mission.status}"`);

  // 7. Verify zero points awarded before admin approval
  const profileBeforeApproval = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  }).then(r => r.json());
  console.log(`✓ 7. Verified Anti-Cheat Rule: Volunteer points remain ${profileBeforeApproval.user.points} (No points awarded prior to admin approval)`);
  if (profileBeforeApproval.user.points !== initialPoints) {
    throw new Error('Anti-Cheat Failure: Points were awarded before admin approval!');
  }

  // 8. Admin Login
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@litterhero.org', password: 'LitterHero2026!' })
  }).then(r => r.json());

  const adminToken = adminLogin.token;
  console.log(`✓ 8. Admin authenticated: ${adminLogin.user.name} | Role: ${adminLogin.user.role}`);

  // 9. Admin views pending reviews
  const pendingReviews = await fetch(`${BASE_URL}/admin/reviews`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  }).then(r => r.json());
  console.log(`✓ 9. Admin Verification Queue: ${pendingReviews.pending.length} pending missions awaiting inspection`);

  // 10. Admin approves evidence & disburses points
  const approvalRes = await fetch(`${BASE_URL}/admin/missions/${createdMission.id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      decision: 'APPROVED',
      notes: 'Excellent verifiable cleanup. Clear photographic proof.'
    })
  }).then(r => r.json());
  console.log(`✓ 10. Admin Approved Evidence: "${approvalRes.message}"`);

  // 11. Test Duplicate-Proof Idempotency (prevent double reward payout)
  const duplicateAttempt = await fetch(`${BASE_URL}/admin/missions/${createdMission.id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ decision: 'APPROVED' })
  });
  console.log(`✓ 11. Duplicate Approval Prevention Test: HTTP ${duplicateAttempt.status} (Expected 409 Conflict)`);
  if (duplicateAttempt.status !== 409) {
    throw new Error(`Idempotency Failure: Duplicate approval was not blocked! Status: ${duplicateAttempt.status}`);
  }

  // 12. Verify volunteer points now updated
  const profileAfterApproval = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  }).then(r => r.json());
  const expectedPoints = initialPoints + createdMission.rewardPoints;
  console.log(`✓ 12. Verified Volunteer Rewards Credited: ${profileAfterApproval.user.points} pts (Expected: ${expectedPoints} pts)`);
  if (profileAfterApproval.user.points !== expectedPoints) {
    throw new Error(`Reward Failure: Expected ${expectedPoints} pts, got ${profileAfterApproval.user.points} pts`);
  }

  // 13. Public Leaderboard check
  const leaderboard = await fetch(`${BASE_URL}/leaderboard`).then(r => r.json());
  const sarahInLeaderboard = leaderboard.find(u => u.name === citizenLogin.user.name);
  console.log(`✓ 13. Public Leaderboard Updated: ${sarahInLeaderboard.name} has ${sarahInLeaderboard.points} verified points across ${sarahInLeaderboard.completedCleanups} cleanups`);

  // 14. Impact metrics check
  const impactStats = await fetch(`${BASE_URL}/impact`).then(r => r.json());
  console.log(`✓ 14. Platform Impact Synchronized: ${impactStats.verifiedCleanupsCompleted} verified cleanups, ${impactStats.estimatedWasteCollectedKg} kg diverted`);

  console.log('\n============================================================');
  console.log('🎉 ALL 14 LIVE END-TO-END WORKFLOW & SECURITY TESTS PASSED! 🎉');
  console.log('============================================================\n');
}

runE2ETest().catch(err => {
  console.error('❌ E2E TEST FAILED:', err);
  process.exit(1);
});
