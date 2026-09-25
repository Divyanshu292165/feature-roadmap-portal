import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { generateRandomToken, hashToken, generateAccessToken, generateRefreshToken } from '../utils/tokens';

export class AuthService {
  static async registerUser(name: string, email: string, passwordStr: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { name: 'ValidationError', errors: { email: { message: 'User already exists' } } };
    }

    const passwordHash = await bcrypt.hash(passwordStr, env.BCRYPT_ROUNDS);
    
    const verificationToken = generateRandomToken();
    const verificationTokenHash = hashToken(verificationToken);
    
    // Expires in 24 hours
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      passwordHash,
      verificationTokenHash,
      verificationTokenExpiresAt
    });

    return { user, verificationToken };
  }

  static async loginUser(email: string, passwordStr: string) {
    const user = await User.findOne({ email });
    if (!user) throw { statusCode: 401, message: 'Invalid credentials' };
    
    const isMatch = await user.comparePassword(passwordStr);
    if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };
    
    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    // Use a random opaque token (not JWT) so refresh tokens are always unique
    const refreshToken = generateRandomToken();
    
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await RefreshToken.create({
      user: user._id,
      tokenHash,
      expiresAt
    });

    return { user, accessToken, refreshToken };
  }

  static async refreshTokens(oldRefreshToken: string) {
    const tokenHash = hashToken(oldRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash });
    
    if (!tokenDoc || tokenDoc.revokedAt || tokenDoc.expiresAt < new Date()) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }
    
    const user = await User.findById(tokenDoc.user);
    if (!user) throw { statusCode: 401, message: 'User not found' };
    
    // Revoke old token (rotation)
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();
    
    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    // Use a random opaque token (not JWT) for refresh tokens — they are validated
    // by hash lookup, not by JWT signature. This also prevents same-second collisions.
    const refreshToken = generateRandomToken();
    
    const newTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await RefreshToken.create({
      user: user._id,
      tokenHash: newTokenHash,
      expiresAt
    });
    
    return { accessToken, refreshToken };
  }

  static async logoutUser(refreshToken: string) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revokedAt: new Date() });
  }

  static async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt: { $gt: new Date() }
    });
    
    if (!user) throw { statusCode: 400, message: 'Invalid or expired token' };
    
    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    return true;
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) return null; 
    
    const token = generateRandomToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    
    return { user, token };
  }

  static async resetPassword(token: string, newPasswordStr: string) {
    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() }
    });
    
    if (!user) throw { statusCode: 400, message: 'Invalid or expired token' };
    
    user.passwordHash = await bcrypt.hash(newPasswordStr, env.BCRYPT_ROUNDS);
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();
    
    await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
    return true;
  }

  static async getCurrentUser(userId: string) {
    return User.findById(userId);
  }
}
