import 'reflect-metadata';
import { DataSource, Tree } from 'typeorm';

export const source = new DataSource({
  type: 'postgres',
  host: 'auth-db',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  synchronize: true,
  logging: false,
  entities: [__dirname + '/entities/**/*.{js,ts}'],
});
