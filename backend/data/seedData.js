import { hashPassword } from '../middleware/auth.js';

// Clean SVG visual placeholders for realistic before/after imagery
export const SVG_IMAGES = {
  creekBefore: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23dbeafe"/><path d="M0,280 Q150,230 300,290 T600,270 L600,400 L0,400 Z" fill="%234b5563"/><path d="M0,320 Q200,300 400,340 T600,310 L600,400 L0,400 Z" fill="%231e3a8a"/><g fill="%23ef4444" opacity="0.85"><circle cx="140" cy="310" r="14"/><rect x="220" y="295" width="28" height="15" rx="3" transform="rotate(25 220 295)"/><circle cx="340" cy="330" r="18"/><polygon points="410,310 435,325 420,345 395,330"/><circle cx="480" cy="305" r="16"/></g><g fill="%23f59e0b" opacity="0.9"><rect x="180" y="320" width="22" height="12" rx="2" transform="rotate(-15 180 320)"/><polygon points="280,310 300,320 295,335 275,325"/><circle cx="440" cy="325" r="12"/></g><rect x="20" y="20" width="220" height="40" rx="8" fill="%23991b1b" opacity="0.9"/><text x="130" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">BEFORE: Heavy Litter Hotspot</text></svg>',

  creekAfter: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23ecfdf5"/><path d="M0,280 Q150,230 300,290 T600,270 L600,400 L0,400 Z" fill="%2315803d"/><path d="M0,320 Q200,300 400,340 T600,310 L600,400 L0,400 Z" fill="%230284c7"/><g fill="%23166534"><circle cx="100" cy="270" r="6"/><circle cx="200" cy="265" r="8"/><circle cx="320" cy="280" r="7"/><circle cx="480" cy="260" r="9"/></g><rect x="20" y="20" width="220" height="40" rx="8" fill="%23059669" opacity="0.9"/><text x="130" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">AFTER: Clean &amp; Restored</text><g transform="translate(420, 240)"><rect width="120" height="80" rx="10" fill="%231e293b" opacity="0.85"/><text x="60" y="35" font-family="sans-serif" font-size="12" fill="%2334d399" text-anchor="middle" font-weight="bold">4 BAGS REMOVED</text><text x="60" y="58" font-family="sans-serif" font-size="10" fill="white" text-anchor="middle">Verified Impact</text></g></svg>',

  plazaBefore: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><rect x="0" y="240" width="600" height="160" fill="%2394a3b8"/><g fill="%23dc2626"><circle cx="120" cy="290" r="15"/><polygon points="260,280 290,295 270,320"/><circle cx="380" cy="310" r="20"/><rect x="470" y="290" width="30" height="20" rx="4"/></g><rect x="20" y="20" width="240" height="40" rx="8" fill="%23991b1b" opacity="0.9"/><text x="140" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">BEFORE: Transit Stop Debris</text></svg>',

  beachBefore: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23fef3c7"/><path d="M0,200 Q300,180 600,220 L600,400 L0,400 Z" fill="%23fde68a"/><g fill="%23b91c1c" opacity="0.8"><circle cx="210" cy="270" r="16"/><rect x="310" y="260" width="26" height="18" rx="4"/><circle cx="450" cy="285" r="14"/></g><rect x="20" y="20" width="240" height="40" rx="8" fill="%23991b1b" opacity="0.9"/><text x="140" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">BEFORE: Coastal Plastics</text></svg>',

  trailBefore: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f0fdf4"/><path d="M0,220 Q250,190 600,230 L600,400 L0,400 Z" fill="%23166534"/><g fill="%23dc2626"><circle cx="160" cy="290" r="12"/><rect x="290" y="280" width="22" height="14" rx="3"/><circle cx="410" cy="310" r="15"/></g><rect x="20" y="20" width="230" height="40" rx="8" fill="%23991b1b" opacity="0.9"/><text x="135" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">BEFORE: Trail Overlook Waste</text></svg>'
};

export function getInitialSeedData() {
  const defaultPasswordHash = hashPassword('LitterHero2026!');

  return {
    users: [
      {
        id: 'usr-admin-001',
        email: 'admin@litterhero.org',
        passwordHash: defaultPasswordHash,
        name: 'Marcus Vance',
        title: 'Chief Environmental Officer',
        role: 'ADMIN',
        points: 0,
        completedCleanups: 0,
        createdAt: '2026-09-01T08:00:00Z',
        badges: ['Platform Auditor', 'Civic Leader']
      },
      {
        id: 'usr-sarah-101',
        email: 'sarah@community.org',
        passwordHash: defaultPasswordHash,
        name: 'Sarah Green',
        role: 'USER',
        points: 280,
        completedCleanups: 4,
        createdAt: '2026-09-10T11:20:00Z',
        badges: ['River Guardian', 'Quick Responder', 'Plastic Buster']
      },
      {
        id: 'usr-alex-102',
        email: 'alex@earthcare.net',
        passwordHash: defaultPasswordHash,
        name: 'Alex Rivera',
        role: 'USER',
        points: 420,
        completedCleanups: 7,
        createdAt: '2026-09-05T14:45:00Z',
        badges: ['Trail Protector', 'Master Cleaner', 'Eco Champion']
      },
      {
        id: 'usr-priya-103',
        email: 'priya@cleanstreets.org',
        passwordHash: defaultPasswordHash,
        name: 'Priya Patel',
        role: 'USER',
        points: 610,
        completedCleanups: 11,
        createdAt: '2026-08-20T09:15:00Z',
        badges: ['Top Contributor', 'Zero Waste Hero', 'Community Pillar', 'Gold Vanguard']
      },
      {
        id: 'usr-demo-104',
        email: 'demo@litterhero.org',
        passwordHash: defaultPasswordHash,
        name: 'Jordan Lee (Demo Citizen)',
        role: 'USER',
        points: 150,
        completedCleanups: 2,
        createdAt: '2026-10-01T10:00:00Z',
        badges: ['First Responder', 'Eco Novice']
      }
    ],

    reports: [
      {
        id: 'rep-101',
        title: 'Mill Creek Trail Plastic Waste',
        description: 'Large accumulation of single-use drink bottles, shopping bags, and styrofoam containers lodged along the riverbank.',
        category: 'plastic',
        severity: 'high',
        location: 'Mill Creek Trail (Mile Marker 2.4), North Bend',
        latitude: 47.4952,
        longitude: -121.7865,
        reportedBy: 'usr-sarah-101',
        reportedByName: 'Sarah Green',
        createdAt: '2026-10-08T14:30:00Z',
        status: 'CONVERTED_TO_MISSION',
        priorityScore: 77,
        photoUrl: SVG_IMAGES.creekBefore
      },
      {
        id: 'rep-102',
        title: 'Downtown Transit Plaza Overfill',
        description: 'Discarded beverage cups, take-out wrappers, and cardboard boxes scattered around bus bays 3 and 4.',
        category: 'mixed',
        severity: 'medium',
        location: 'Central Transit Center, Bay 3-4',
        latitude: 47.6062,
        longitude: -122.3321,
        reportedBy: 'usr-alex-102',
        reportedByName: 'Alex Rivera',
        createdAt: '2026-10-10T09:15:00Z',
        status: 'CONVERTED_TO_MISSION',
        priorityScore: 58,
        photoUrl: SVG_IMAGES.plazaBefore
      },
      {
        id: 'rep-103',
        title: 'Sunset Beach Shoreline Drift Debris',
        description: 'Fishery rope fragments, broken plastic coolers, and drink cans washed onto public recreational beachfront.',
        category: 'plastic',
        severity: 'high',
        location: 'Sunset Beach South Jetty, Coastal Access Point',
        latitude: 47.6521,
        longitude: -122.4089,
        reportedBy: 'usr-priya-103',
        reportedByName: 'Priya Patel',
        createdAt: '2026-10-10T16:00:00Z',
        status: 'CONVERTED_TO_MISSION',
        priorityScore: 82,
        photoUrl: SVG_IMAGES.beachBefore
      },
      {
        id: 'rep-104',
        title: 'Pinecrest Ridge Trail Overlook',
        description: 'Empty snack packaging and glass bottles scattered around scenic bench viewpoint.',
        category: 'paper',
        severity: 'low',
        location: 'Pinecrest Ridge Viewpoint, Summit Loop',
        latitude: 47.5312,
        longitude: -122.1402,
        reportedBy: 'usr-demo-104',
        reportedByName: 'Jordan Lee',
        createdAt: '2026-10-05T11:00:00Z',
        status: 'CONVERTED_TO_MISSION',
        priorityScore: 38,
        photoUrl: SVG_IMAGES.trailBefore
      }
    ],

    missions: [
      {
        id: 'msn-201',
        reportId: 'rep-101',
        title: 'Clear Plastics along Mill Creek Trail',
        description: 'Collect and safely bag plastic bottles, bags, and styrofoam along the 200m riparian zone of Mill Creek.',
        category: 'plastic',
        severity: 'high',
        location: 'Mill Creek Trail (Mile Marker 2.4)',
        latitude: 47.4952,
        longitude: -121.7865,
        priorityScore: 77,
        rewardPoints: 120,
        status: 'PENDING_REVIEW', // Ready for Admin Review Demo!
        claimedBy: 'usr-sarah-101',
        claimedByName: 'Sarah Green',
        claimedAt: '2026-10-09T09:00:00Z',
        beforePhotoUrl: SVG_IMAGES.creekBefore,
        evidence: {
          submittedAt: '2026-10-11T11:45:00Z',
          submittedBy: 'usr-sarah-101',
          afterPhotoUrl: SVG_IMAGES.creekAfter,
          notes: 'Team collected 4 large heavy-duty bags of plastic bottles and packaging. Creek banks are completely clear and trash delivered to community recycling center.',
          estimatedWasteKg: 28,
          bagsCollected: 4,
          reviewStatus: 'PENDING_REVIEW',
          rejectionReason: null
        },
        reviews: []
      },
      {
        id: 'msn-202',
        reportId: 'rep-102',
        title: 'Downtown Transit Plaza Cleanup',
        description: 'Restore cleanliness around Transit Bay 3-4 by gathering loose containers and paper litter.',
        category: 'mixed',
        severity: 'medium',
        location: 'Central Transit Center, Bay 3-4',
        latitude: 47.6062,
        longitude: -122.3321,
        priorityScore: 58,
        rewardPoints: 80,
        status: 'AVAILABLE', // Available for user to claim in judge demo!
        claimedBy: null,
        claimedByName: null,
        claimedAt: null,
        beforePhotoUrl: SVG_IMAGES.plazaBefore,
        evidence: null,
        reviews: []
      },
      {
        id: 'msn-203',
        reportId: 'rep-103',
        title: 'Sunset Beach Shoreline Sweep',
        description: 'Sweep 300 meters of shoreline to prevent plastic marine debris from washing back into the tide.',
        category: 'plastic',
        severity: 'high',
        location: 'Sunset Beach South Jetty',
        latitude: 47.6521,
        longitude: -122.4089,
        priorityScore: 82,
        rewardPoints: 150,
        status: 'AVAILABLE',
        claimedBy: null,
        claimedByName: null,
        claimedAt: null,
        beforePhotoUrl: SVG_IMAGES.beachBefore,
        evidence: null,
        reviews: []
      },
      {
        id: 'msn-204',
        reportId: 'rep-104',
        title: 'Pinecrest Ridge Trail Overlook Blitz',
        description: 'Clear snack packaging and cans around summit bench.',
        category: 'paper',
        severity: 'low',
        location: 'Pinecrest Ridge Viewpoint',
        latitude: 47.5312,
        longitude: -122.1402,
        priorityScore: 38,
        rewardPoints: 50,
        status: 'APPROVED',
        claimedBy: 'usr-priya-103',
        claimedByName: 'Priya Patel',
        claimedAt: '2026-10-06T10:00:00Z',
        beforePhotoUrl: SVG_IMAGES.trailBefore,
        evidence: {
          submittedAt: '2026-10-07T12:00:00Z',
          submittedBy: 'usr-priya-103',
          afterPhotoUrl: SVG_IMAGES.creekAfter,
          notes: 'Picked up 1 bag of mixed paper and aluminum.',
          estimatedWasteKg: 5,
          bagsCollected: 1,
          reviewStatus: 'APPROVED',
          rejectionReason: null
        },
        reviews: [
          {
            reviewedAt: '2026-10-07T15:30:00Z',
            reviewedBy: 'usr-admin-001',
            reviewerName: 'Marcus Vance',
            decision: 'APPROVED',
            awardedPoints: 50,
            notes: 'Verified before and after clean condition.'
          }
        ]
      }
    ],

    auditLogs: [
      {
        id: 'log-001',
        timestamp: '2026-10-07T15:30:00Z',
        actorId: 'usr-admin-001',
        actorName: 'Marcus Vance (Admin)',
        action: 'VERIFY_EVIDENCE_APPROVED',
        targetId: 'msn-204',
        details: 'Approved cleanup evidence for Pinecrest Ridge Trail. 50 points credited to Priya Patel.'
      }
    ],

    impactStats: {
      totalReportsSubmitted: 16,
      verifiedCleanupsCompleted: 14,
      estimatedWasteCollectedKg: 485,
      bagsCollected: 72,
      activeVolunteers: 38,
      verifiedPointsAwarded: 1460
    }
  };
}
