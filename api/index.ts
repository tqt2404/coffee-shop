import { createApiApp } from '../server/app.ts';

// Vercel Serverless Function entrypoint exporting our modular Express API app.
// Works seamlessly on Vercel Free Hobby plan alongside Vite static SPA output.
const app = createApiApp();

export default app;
