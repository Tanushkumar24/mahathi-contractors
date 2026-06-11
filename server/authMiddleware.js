import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAILS = [
  'mahathicontractors@gmail.com',
  'devigayatri2002@gmail.com',
  'tanushkumar2006@gmail.com',
  'simhadri.tanushkumar@gmail.com'
];

if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is missing!');
}

/**
 * Middleware to verify user JWT token
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Middleware to restrict route to administrators only
 */
export function verifyAdmin(req, res, next) {
  const email = (req.user?.email || '').toLowerCase();
  if (!req.user || (req.user.role !== 'admin' && !ADMIN_EMAILS.includes(email))) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}
