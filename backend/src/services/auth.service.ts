import { User, IUser } from '../models/User';
import { CategoryService } from './category.service';
import { Types } from 'mongoose';

export class AuthService {
  static async register(data: {
    fullName: string;
    email: string;
    password?: string;
  }): Promise<IUser> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const user = new User({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      password: data.password,
    });

    await user.save();

    // Automatically seed default categories for new user
    await CategoryService.seedDefaults(user._id as unknown as Types.ObjectId);

    return user;
  }

  static async login(email: string, password?: string): Promise<IUser> {
    if (!password) {
      throw new Error('Invalid email or password.');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    return user;
  }

  static async getUserProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  static async updateProfile(
    userId: string,
    data: { fullName?: string; currency?: string; theme?: 'dark' | 'light' }
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
  }
}
