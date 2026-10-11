import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'litterhero-super-secret-production-grade-key-2026';
const JWT_EXPIRES_IN = '24h';

export function hashPassword(plainTextPassword) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainTextPassword, salt);
}

export function comparePassword(plainTextPassword, hashedPassword) {
  return bcrypt.compareSync(plainTextPassword, hashedPassword);
}

export function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role // 'USER' | 'ADMIN'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is missing or malformed.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired session token. Please log in again.'
    });
  }
}

/**
 * Strict role enforcement middleware.
 * Verifies that the authenticated token contains the ADMIN role.
 * Never trusts client request bodies or headers.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required.'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden: Administrative privileges required. Citizen accounts cannot access verification operations.'
    });
  }

  next();
}
