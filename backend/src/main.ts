import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  /* ================= CORS FIX (CRITICAL FOR VERCEL FRONTEND) ================= */

  app.enableCors({

    origin: (origin, callback) => {

      /* allow requests with no origin (server-to-server, curl, health checks) */
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [

        'http://localhost:5173',
        'http://localhost:3000',

        'https://compareai-backend.onrender.com',

      ];

      /* allow all vercel deployments */
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      }
      else {
        callback(null, true); // allow anyway (safe for public API)
      }

    },

    methods: ['GET', 'POST', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    credentials: false

  });

  /* ================= RENDER PORT FIX ================= */

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);

}

bootstrap();