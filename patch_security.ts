import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const securityCode = `
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
`;

content = content.replace(
  /import express from "express";/,
  securityCode + '\nimport express from "express";'
);

const middlewareCode = `
  const app = express();
  
  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local dev / iframe rendering compatibility
    crossOriginEmbedderPolicy: false
  }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  app.use('/api', limiter);
`;

content = content.replace(
  /const app = express\(\);/,
  middlewareCode
);

fs.writeFileSync('server.ts', content);
