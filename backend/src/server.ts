import { buildApp } from './app.js';
import { config } from './config.js';
import { registerJobs } from './jobs/index.js';

const app = await buildApp();

// Register cron jobs before listening
registerJobs(app.log);

try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
