import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/financeflow',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_financeflow_2026_change_in_production',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
