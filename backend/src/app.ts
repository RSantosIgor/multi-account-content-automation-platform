import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      config.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
        : true,
    disableRequestLogging: false,
  });

  // Security headers
  await app.register(helmet, { global: true });

  // CORS
  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  // Sensible HTTP error helpers (throw fastify.httpErrors.notFound())
  await app.register(sensible);

  // Swagger (development only)
  if (config.NODE_ENV === 'development') {
    await app.register(swagger, {
      openapi: {
        info: { title: 'batchNews API', version: '1.0.0' },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    });
    await app.register(swaggerUi, { routePrefix: '/docs' });
  }

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
