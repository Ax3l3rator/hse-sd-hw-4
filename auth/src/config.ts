import { config } from 'dotenv';
config({ path: __dirname + '/.env' });

export const port = process.env.PORT || 3000;
export const secret = process.env.SECRET || 'secretniy secret';
