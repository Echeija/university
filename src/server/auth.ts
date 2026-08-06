
import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { AuditLogger } from '../services/AuditLogger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
export const authRouter = Router();

authRouter.post('/register-applicant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, middleName, lastName, phone, email, username, password, profilePicture } = req.body;
    
    if (!firstName || !lastName || !email || !username || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if email or username already exists    
    const [existing] = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username)));
    if (existing) {
      res.status(400).json({ error: 'Email or Username already taken' });
      return;
    }

    const [newUser] = await db.insert(users).values({
      name,
      email,
      username,
      phone,
      password: hashedPassword,
      profilePicture,
      role: 'Applicant',
      createdAt: new Date()
    }).returning();
    
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = email || username;

    if (!loginIdentifier || !password) {
      res.status(400).json({ error: 'Email/Username and password required' });
      return;
    }
    
    const [user] = await db.select().from(users).where(or(eq(users.email, loginIdentifier), eq(users.username, loginIdentifier)));

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    await AuditLogger.log(user.id, 'login', `Successful login for ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phone: user.phone,
        department: user.department,
        faculty: user.faculty
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (userRecord.length === 0) {
      res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      return;
    }

    console.log(`[EMAIL SIMULATION] Sent password reset link to ${email} (User ID: ${userRecord[0].id}, Role: ${userRecord[0].role})`);

    await AuditLogger.log(
      userRecord[0].id,
      'password_reset_requested',
      `Password reset requested for ${email}`
    );

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};
