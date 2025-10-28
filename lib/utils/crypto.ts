import crypto from 'crypto';

export const timingSafeCompare = (a: string, b: string): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length === 0 || b.length === 0) {
    return false;
  }

  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    
    if (bufA.length !== bufB.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return timingSafeCompare(hash, verifyHash);
  } catch {
    return false;
  }
};

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashSHA256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};
