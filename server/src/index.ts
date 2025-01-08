import dotenv from 'dotenv';
import path from 'path';
import { app, logger, prisma } from './app';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Connected to database successfully');

    // Start server
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
      logger.info('📚 Available Routes:');
      logger.info(`  → GET /api/health - Health check endpoint`);
      logger.info(`  → GET /api/test-db - Test database connection`);
      logger.info(`  → POST /api/auth/login - User login`);
      logger.info(`  → POST /api/auth/refresh-token - Refresh access token`);
      logger.info(`  → POST /api/auth/logout - User logout`);
      logger.info(`  → GET /api/auth/me - Get current user`);
      logger.info(`  → GET /api/payments - Payment endpoints`);
      logger.info(`  → GET /api/accounts - Account endpoints`);
      logger.info(`  → GET /api/accounts/transactions - Account transaction endpoints`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

start();

export { app };
