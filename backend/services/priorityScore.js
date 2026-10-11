/**
 * LitterHero - Explainable Cleanup Priority Score Engine
 * 
 * Heuristic priority calculation based on:
 * 1. Severity Level (0-40 pts): Low, Medium, High, Critical
 * 2. Waste Category Environmental Hazard (0-30 pts): Plastic, Hazardous/Chemical, Mixed, Food, Paper
 * 3. Community Proximity / Hotspot Density (0-20 pts)
 * 4. Time Pending Urgency (0-10 pts)
 * 
 * Transparent and explainable — not black-box AI.
 */

const SEVERITY_SCORES = {
  low: 10,
  medium: 20,
  high: 32,
  critical: 40
};

const CATEGORY_SCORES = {
  hazardous: 30,
  plastic: 25,
  mixed: 18,
  food: 12,
  paper: 8,
  other: 10
};

/**
 * Calculates a transparent 0-100 priority score with clear explanation.
 * @param {Object} params
 * @param {string} params.severity - 'low' | 'medium' | 'high' | 'critical'
 * @param {string} params.category - 'plastic' | 'paper' | 'food' | 'mixed' | 'hazardous' | 'other'
 * @param {number} [params.nearbyReportsCount=0] - number of reports within 500m
 * @param {number} [params.daysSinceReported=0] - days elapsed since report
 * @returns {Object} { score, breakdown, explanation, badge }
 */
export function calculatePriorityScore({
  severity = 'medium',
  category = 'plastic',
  nearbyReportsCount = 0,
  daysSinceReported = 0
}) {
  const normSeverity = (severity || 'medium').toLowerCase();
  const normCategory = (category || 'plastic').toLowerCase();

  const severityPts = SEVERITY_SCORES[normSeverity] || 20;
  const categoryPts = CATEGORY_SCORES[normCategory] || 15;
  
  // Cluster density factor (up to 20 pts)
  const clusterPts = Math.min(20, nearbyReportsCount * 5);
  
  // Time urgency factor (up to 10 pts, 2 pts per day pending)
  const urgencyPts = Math.min(10, Math.floor(daysSinceReported * 2));

  const totalScore = Math.min(100, severityPts + categoryPts + clusterPts + urgencyPts);

  let badge = 'Standard';
  let badgeColor = 'emerald';
  if (totalScore >= 75) {
    badge = 'Critical Priority';
    badgeColor = 'rose';
  } else if (totalScore >= 50) {
    badge = 'High Priority';
    badgeColor = 'amber';
  } else if (totalScore >= 30) {
    badge = 'Moderate';
    badgeColor = 'blue';
  }

  const reasons = [];
  reasons.push(`${normSeverity.toUpperCase()} severity rated (${severityPts}/40 pts)`);
  reasons.push(`${normCategory.toUpperCase()} environmental risk rating (${categoryPts}/30 pts)`);
  if (clusterPts > 0) {
    reasons.push(`Hotspot cluster density: ${nearbyReportsCount} nearby reports (+${clusterPts} pts)`);
  }
  if (urgencyPts > 0) {
    reasons.push(`Accumulation time: ${daysSinceReported} days pending (+${urgencyPts} pts)`);
  }

  return {
    score: totalScore,
    badge,
    badgeColor,
    breakdown: {
      severity: severityPts,
      category: categoryPts,
      cluster: clusterPts,
      urgency: urgencyPts
    },
    explanation: reasons.join(' • ')
  };
}
