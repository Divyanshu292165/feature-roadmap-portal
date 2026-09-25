import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { env } from '../config/env';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validators';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req).body;
  const { user, verificationToken } = await AuthService.registerUser(name, email, password);
  
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  await sendVerificationEmail(email, name, verificationToken, verificationUrl);
  
  res.status(201).json(successResponse({ user }, 'Registration successful. Please check your email to verify your account.'));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req).body;
  
  try {
    const { user, accessToken, refreshToken } = await AuthService.loginUser(email, password);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.json(successResponse({ user, accessToken }));
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json(errorResponse(err.message, 'AUTH_ERROR', err.statusCode));
    } else {
      throw err;
    }
  }
};

export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json(errorResponse('No refresh token provided', 'NO_TOKEN', 401));
  }
  
  try {
    const { accessToken, refreshToken } = await AuthService.refreshTokens(oldRefreshToken);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.json(successResponse({ accessToken }));
  } catch (err: any) {
    res.clearCookie('refreshToken', { path: '/' });
    if (err.statusCode) {
      res.status(err.statusCode).json(errorResponse(err.message, 'AUTH_ERROR', err.statusCode));
    } else {
      throw err;
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await AuthService.logoutUser(refreshToken);
  }
  res.clearCookie('refreshToken', { path: '/' });
  res.json(successResponse(null, 'Logged out successfully'));
};

export const verifyEmail = async (req: Request, res: Response) => {
  verifyEmailSchema.parse(req);
  const token = req.body?.token || req.params?.token || (req.query?.token as string);
  
  if (!token) {
    return res.status(400).json(errorResponse('Verification token is required', 'VALIDATION_ERROR', 400));
  }
  
  try {
    await AuthService.verifyEmail(token);
    res.json(successResponse(null, 'Email verified successfully'));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message || 'Verification failed', 'VERIFY_ERROR', 400));
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req).body;
  const result = await AuthService.forgotPassword(email);
  
  if (result) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${result.token}`;
    await sendPasswordResetEmail(result.user.email, result.user.name, result.token, resetUrl);
  }
  
  res.json(successResponse(null, 'If an account exists with that email, a password reset link has been sent.'));
};

export const resetPassword = async (req: Request, res: Response) => {
  resetPasswordSchema.parse(req);
  const token = req.body?.token || req.params?.token || (req.query?.token as string);
  const password = req.body?.password || req.body?.newPassword;
  
  if (!token) {
    return res.status(400).json(errorResponse('Reset token is required', 'VALIDATION_ERROR', 400));
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json(errorResponse('Password must be at least 8 characters long', 'VALIDATION_ERROR', 400));
  }
  
  try {
    await AuthService.resetPassword(token, password);
    res.json(successResponse(null, 'Password has been reset successfully'));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message || 'Reset failed', 'RESET_ERROR', 400));
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED', 401));
  }
  const user = await AuthService.getCurrentUser(req.user.id);
  res.json(successResponse({ user }));
};
