import { config } from 'dotenv';
config();

export const port = process.env.PORT || 3000;
export const secret = process.env.SECRET;
