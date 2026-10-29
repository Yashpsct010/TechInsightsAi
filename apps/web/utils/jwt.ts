import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'techinsights_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export function generateToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Extracts bearer token from NextRequest Authorization header
 */
export function extractTokenFromHeader(header: string | null): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.split(' ')[1] || null;
}
