import { app, httpServer, logger } from './app';

const port = process.env.PORT || 3002;

httpServer.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
