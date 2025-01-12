import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { createServer } from 'http';
import { SocketService } from './socket';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { errorHandler } from './middleware/error-handler';
import { restaurantsRouter } from './routes/restaurants.routes';
import { branchesRouter } from './routes/branches.routes';
import { tablesRouter } from './routes/tables.routes';
import { categoriesRouter } from './routes/categories.routes';
import { productsRouter } from './routes/products.routes';
import { ordersRouter } from './routes/orders.routes';
import { kitchenRoutes } from './routes/kitchen.routes';
import { barRoutes } from './routes/bar.routes';
import { stockRouter } from './routes/stock.routes';
import { suppliersRouter } from './routes/suppliers.routes';
import { purchaseOrdersRouter } from './routes/purchase.orders.routes';
import customersRouter from './routes/customers.routes';
import reservationsRouter from './routes/reservations.routes';
import paymentRoutes from './routes/payment.routes';
import accountRoutes from './routes/account.routes';
import accountTransactionRoutes from './routes/account.transaction.routes';
import { reportsRouter } from './routes/reports.routes';
import printerRoutes from './routes/printer.routes';
import permissionsRouter from './routes/permissions.routes';
import { recipesRouter } from './routes/recipes.routes';
import { discountsRouter } from './routes/discounts.routes';
import { cardPaymentsRouter } from './routes/card.payments.routes';
import { optionGroupRouter } from './routes/product.option.group.routes';
import { optionRouter } from './routes/product.option.routes';
import { orderItemRouter } from './routes/order.item.routes';
import { recipeIngredientsRouter } from './routes/recipe.ingredients.routes';
import { priceHistoryRouter } from './routes/price.history.routes';
import { purchaseOrderItemsRouter } from './routes/purchase.order.items.routes';
import { productSupplierRouter } from './routes/product.supplier.routes';
import { settingsRouter } from './routes/settings.routes';
import optionsRouter from './routes/options.routes';
import path from 'path';
import { reservationScheduler } from './services/reservation-scheduler.service';
import { quickSaleRouter } from './routes/quick.sale.routes';

// Initialize logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Express app
const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
SocketService.initialize(httpServer);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:3002", "http://localhost:3002", "http://localhost:3000"],
      upgradeInsecureRequests: null
    }
  }
}));

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body,
    },
    'Incoming request'
  );
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Test database connection endpoint
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('Database connection successful');
    res.json({
      status: 'success',
      message: 'Database connection successful',
      data: result,
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Statik dosyaları sun
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api', optionGroupRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/bar', barRoutes);
app.use('/api/stocks', stockRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/accounts/transactions', accountTransactionRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/printers', printerRoutes);
app.use('/api', permissionsRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/card-payments', cardPaymentsRouter);
app.use('/api/options', optionRouter);
app.use('/api/order-items', orderItemRouter);
app.use('/api/recipe-ingredients', recipeIngredientsRouter);
app.use('/api/price-history', priceHistoryRouter);
app.use('/api/purchase-order-items', purchaseOrderItemsRouter);
app.use('/api/product-suppliers', productSupplierRouter);
app.use('/api/settings', settingsRouter);
app.use('/api', optionsRouter);
app.use('/api/quick-sale', quickSaleRouter);

// Error handling
app.use(errorHandler);

// Initialize reservation scheduler
console.log('🕒 [App] Rezervasyon zamanlayıcısı başlatılıyor...');
reservationScheduler;

export { app, httpServer, logger, prisma };
