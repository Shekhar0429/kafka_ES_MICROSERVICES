import dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.APP_PORT;
export const DATABASE_URL = process.env.DATABASE_URL;