import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { generateToken, sendAuthCookie, clearAuthCookie } from '../utils/jwt';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await AuthService.register(req.body);
      const token = generateToken(user._id.toString());
      sendAuthCookie(res, token);

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          currency: user.currency,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      const token = generateToken(user._id.toString());
      sendAuthCookie(res, token);

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          currency: user.currency,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(401).json({ message: (error as Error).message });
    }
  }

  static async logout(req: AuthRequest, res: Response): Promise<void> {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        currency: req.user.currency,
        theme: req.user.theme,
        createdAt: req.user.createdAt,
      },
    });
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const updatedUser = await AuthService.updateProfile(req.user._id.toString(), req.body);
      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          currency: updatedUser.currency,
          theme: updatedUser.theme,
          createdAt: updatedUser.createdAt,
        },
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
