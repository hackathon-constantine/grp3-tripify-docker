import * as dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.PORT || 3001  ;
export const MONGO_URI = process.env.MONGO_URI || 'tbd';
export const APP_HOST = process.env.APP_HOST || 'localhost';
export const guidiniApiUrl = process.env.guidini_api_url || 'tbd';
export const guidiniApiKey = process.env.guidini_api_key || 'tbd';
export const guidiniApiSecret = process.env.guidini_api_secret || 'tbd';