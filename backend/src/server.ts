import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`FinanceFlow Backend API listening on port ${env.PORT} in ${env.NODE_ENV} mode.`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
