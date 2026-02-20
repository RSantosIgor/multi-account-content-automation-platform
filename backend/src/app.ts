import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import { config } from './config.js';
import authenticatePlugin from './plugins/authenticate.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      config.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
        : config.NODE_ENV === 'test'
          ? false
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

  // Authentication plugin (decorates fastify.authenticate)
  await app.register(authenticatePlugin);

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

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    // Zod validation errors → 400
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      });
    }

    // Fastify HTTP errors (from @fastify/sensible)
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    // Unhandled errors
    const statusCode = error.statusCode ?? 500;

    if (config.NODE_ENV === 'production') {
      app.log.error(error);
      return reply.status(statusCode).send({
        statusCode,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }

    // Development / test: include stack trace
    app.log.error(error);
    return reply.status(statusCode).send({
      statusCode,
      error: error.name,
      message: error.message,
      stack: error.stack,
    });
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
