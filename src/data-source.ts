export class DataSource {}

import { config } from 'dotenv'
import { DataSourceOptions } from 'typeorm';

config(); // มองหา env
// ใช้ typeorm เข้าถึงฐานข้อมูล
export const dataSourceOpts: DataSourceOptions = {
  type: 'postgres',
  logging: true,
  url: process.env.DATABASE_URL
}
