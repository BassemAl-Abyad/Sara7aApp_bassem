import { resolve } from "node:path";
import dotenv from "dotenv";

const envPath = {
  development: `.env.dev`,
  production: `.env.prod`,
};
dotenv.config({ path: resolve(`./config/${envPath.development}`) });

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URI;
export const REDIS_URI = process.env.REDIS_URI;
export const SALT = parseInt(process.env.SALT);
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET_KEY;
//User Tokens
export const TOKEN_USER_ACCESS_KEY = process.env.TOKEN_ACCESS_USER_SECRET_KEY;
export const REFRESH_USER_SECRET_KEY =
  process.env.TOKEN_REFRESH_USER_SECRET_KEY;
//Admin Tokens
export const TOKEN_ADMIN_ACCESS_KEY = process.env.TOKEN_ACCESS_ADMIN_SECRET_KEY;
export const REFRESH_ADMIN_SECRET_KEY =
  process.env.TOKEN_REFRESH_ADMIN_SECRET_KEY;

export const ACCESS_EXPIRES = Number(process.env.ACCESS_EXPIRES);
export const REFRESH_EXPIRES = Number(process.env.REFRESH_EXPIRES);

// Social Login
export const CLIENT_ID = process.env.CLIENT_ID;

// Sending email
export const USER_EMAIL = process.env.USER_EMAIL;
export const USER_PASSWORD = process.env.USER_PASSWORD;

// CORS Configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS === "true";
export const CORS_METHODS = process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE";
export const CORS_ALLOWED_HEADERS = process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization";

// Logger Configuration
export const NODE_ENV = process.env.NODE_ENV || "development";
export const MORGAN_FORMAT = process.env.MORGAN_FORMAT || "combined";

// Rate Limiting Configuration
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100; // 100 requests per window

