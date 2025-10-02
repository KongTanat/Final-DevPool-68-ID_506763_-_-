export class DataSource {}
// data-source.ts
import { config } from 'dotenv'
import { DataSourceOptions } from 'typeorm';

config();

export const dataSourceOpts: DataSourceOptions = {
  type: 'postgres',
  logging: true,
  url: process.env.DATABASE_URL
}
