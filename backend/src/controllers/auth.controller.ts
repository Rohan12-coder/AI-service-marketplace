import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import Provider from '../models/Provider';
import { generateToken, generateResetToken, verifyResetToken } from '../utils/jwt';
import { sendEmail, templates } from '../utils/email';
import { sendSuccess, sendError } from '../utils/helpers';
import env from '../config/env';

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, email, password, phone, role,
      businessName, category, serviceArea,
    } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Name, email and password are required.', 400);
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }

    const allowedRoles = ['user', 'provider'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({
      name, email, password, phone,
      role: userRole,
    });

    // Create provider profile stub if role is provider
    if (userRole === 'provider') {
      await Provider.create({
        userId:       user._id,
        businessName: businessName || name,
        category:     category || undefined,
        location:     serviceArea ? { address: serviceArea } : {},
      });
    }

    const token = generateToken({
      id:    String(user._id),
      role:  user.role,
      email: user.email,
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to:      user.email,
      subject: 'Welcome to Smart Service Marketplace!',
      html:    templates.welcome(user.name),
    });

    sendSuccess(
      res,
      {
        token,
        user: {
          _id:   user._id,
          name:  user.name,
          email: user.email,
          role:  user.role,
          phone: user.phone,
        },
      },
      'Account created successfully.',
      201
    );
  } catch (error) {
    const err = error as Error & { code?: number };
    if (err.code === 11000) {
      sendError(res, 'Email already registered.', 409);
    } else {
      sendError(res, err.message || 'Registration failed.', 500);
    }
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Your account has been deactivated. Contact support.', 403);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({
      id:    String(user._id),
      role:  user.role,
      email: user.email,
    });

    // Fetch provider ID if role is provider
    let providerId: string | undefined;
    if (user.role === 'provider') {
      const provider = await Provider.findOne({ userId: user._id }).select('_id');
      if (provider) providerId = String(provider._id);
    }

    sendSuccess(res, {
      token,
      user: {
        _id:        user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        phone:      user.phone,
        avatar:     user.avatar,
        isVerified: user.isVerified,
        providerId,
      },
    }, 'Login successful.');
  } catch (error) {
    const err = error as Error;
    sendError(res, err.message || 'Login failed.', 500);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = (_req: Request, res: Response): void => {
  // JWT is stateless; client should discard the token.
  // If using cookies, clear it:
  res.clearCookie('token');
  sendSuccess(res, null, 'Logged out successfully.');
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      sendError(res, 'Email is required.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) {
      sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
      return;
    }

    const resetToken   = generateResetToken(String(user._id));
    const hashedToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetUrl     = `${env.FRONTEND_URL}/reset-password/${resetToken}`;

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to:      user.email,
      subject: 'Password Reset — Smart Service Marketplace',
      html:    templates.passwordReset(user.name, resetUrl),
    });

    sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
  } catch (error) {
    const err = error as Error;
    sendError(res, err.message || 'Failed to send reset email.', 500);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      sendError(res, 'Password must be at least 8 characters.', 400);
      return;
    }

    // Verify JWT reset token
    let decoded: { id: string };
    try {
      decoded = verifyResetToken(token);
    } catch {
      sendError(res, 'Invalid or expired reset link. Please request a new one.', 400);
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id:                  decoded.id,
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      sendError(res, 'Reset link is invalid or has expired.', 400);
      return;
    }

    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const newToken = generateToken({
      id:    String(user._id),
      role:  user.role,
      email: user.email,
    });

    sendSuccess(res, { token: newToken }, 'Password reset successfully. You are now logged in.');
  } catch (error) {
    const err = error as Error;
    sendError(res, err.message || 'Password reset failed.', 500);
  }
};

// ── Get Current User ──────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('savedProviders', 'businessName rating coverImage');

    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id })
        .populate('category', 'name icon slug');
    }

    sendSuccess(res, { user, providerProfile }, 'User fetched successfully.');
  } catch (error) {
    const err = error as Error;
    sendError(res, err.message || 'Failed to fetch user.', 500);
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      sendError(res, 'Current and new passwords are required.', 400);
      return;
    }

    if (newPassword.length < 8) {
      sendError(res, 'New password must be at least 8 characters.', 400);
      return;
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      sendError(res, 'Current password is incorrect.', 401);
      return;
    }

    if (currentPassword === newPassword) {
      sendError(res, 'New password must be different from current password.', 400);
      return;
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken({
      id:    String(user._id),
      role:  user.role,
      email: user.email,
    });

    sendSuccess(res, { token }, 'Password changed successfully.');
  } catch (error) {
    const err = error as Error;
    sendError(res, err.message || 'Failed to change password.', 500);
  }
};
