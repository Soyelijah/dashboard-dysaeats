import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate requests using Supabase JWT
 * Extracts the token from the Authorization header and validates it
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }
    
    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Format is: Bearer [token]'
      });
    }
    
    const token = parts[1];
    
    // Verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Add the user to the request object
    req.user = user;
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};